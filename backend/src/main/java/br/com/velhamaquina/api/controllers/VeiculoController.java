package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.ImagemVeiculo;
import br.com.velhamaquina.api.models.Marca;
import br.com.velhamaquina.api.models.Veiculo;
import br.com.velhamaquina.api.models.Proprietario;
import br.com.velhamaquina.api.repositories.ImagemRepository;
import br.com.velhamaquina.api.repositories.ProprietarioRepository;
import br.com.velhamaquina.api.repositories.VeiculoRepository;
import br.com.velhamaquina.api.repositories.MarcaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/veiculos")
public class VeiculoController {
    private final VeiculoRepository  veiculoRepository;
    private final ObjectMapper objectMapper;
    private final MarcaRepository marcaRepository;
    private final ProprietarioRepository proprietarioRepository;
    private final ImagemRepository imagemRepository;


    @Value("${upload.diretorio.imagens}")
    private String caminhoUpload;

    @Value("${upload.url-base}")
    private String urlBase;

    public VeiculoController(VeiculoRepository veiculoRepository, ObjectMapper objectMapper, MarcaRepository marcaRepository, ProprietarioRepository proprietarioRepository, ImagemRepository imagemRepository) {
        this.veiculoRepository = veiculoRepository;
        this.objectMapper = objectMapper;
        this.marcaRepository = marcaRepository;
        this.proprietarioRepository = proprietarioRepository;
        this.imagemRepository = imagemRepository;
    }

    @GetMapping
    public List<Veiculo> buscarVeiculos(){
        return veiculoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Veiculo> buscarPorId(@PathVariable Integer id) {
        // Busca o veículo no banco. FetchType.EAGER garantirá
        // que o modelo, categoria e imagens venham juntos.
        return veiculoRepository.findById(id)
                .map(veiculo -> ResponseEntity.ok(veiculo)) // Se encontrar, retorna 200 OK
                .orElse(ResponseEntity.notFound().build()); // Se não, retorna 404 Not Found
    }

    @PostMapping("/anunciar")
    public ResponseEntity<Veiculo> anunciarVeiculo(
            @RequestParam("imagens") List<MultipartFile> imagens,
            @RequestParam("veiculoJson") String veiculoJson
    ) {
        try {
            // 1. Converter o JSON em objeto Veiculo
            Veiculo veiculo = objectMapper.readValue(veiculoJson, Veiculo.class);

            veiculo.setImagens(new ArrayList<>());

            for (int i = 0; i < imagens.size() ; i++) {
                MultipartFile arquivo = imagens.get(i);
                //NomeOriginal do Arquivo
                String nomeOriginal = arquivo.getOriginalFilename();
                String extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                String nomeUnico = UUID.randomUUID().toString() + extensao;

                //  Cria o caminho completo para salvar o arquivo no disco
                File arquivoDestino = new File(caminhoUpload + nomeUnico);

                // Salva o arquivo da memória para o disco
                arquivo.transferTo(arquivoDestino);

                // Criar a URL pública (ex: http://.../uuid.jpg)
                String urlPublica = urlBase + nomeUnico;

                // Criar o objeto ImagemVeiculo
                ImagemVeiculo imagem = new ImagemVeiculo();
                imagem.setUrlImagem(urlPublica);
                imagem.setOrdem(i); // Usa a ordem do loop (0, 1, 2...)
                imagem.setVeiculo(veiculo); // Linka a imagem de volta ao veículo

                // Adicionar a nova imagem à lista do veículo
                veiculo.getImagens().add(imagem);
            }
            Proprietario proprietarioDoJson = veiculo.getProprietario();

            // Procura no banco se um proprietário com este EMAIL já existe
            Optional<Proprietario> proprietarioExistente = proprietarioRepository.findByEmail(proprietarioDoJson.getEmail());

            Proprietario proprietarioParaSalvar;
            if (proprietarioExistente.isPresent()) {
                // Se SIM: usamos o proprietário existente
                proprietarioParaSalvar = proprietarioExistente.get();
            } else {
                // Se NÃO: é um proprietário novo, então salvamos ele
                proprietarioParaSalvar = proprietarioRepository.save(proprietarioDoJson);
            }

            // Atualiza o Veículo com o Proprietário correto (novo ou existente)
            veiculo.setProprietario(proprietarioParaSalvar);

            // Pega a marca "nova" que veio do JSON
            Marca marcaDoJson = veiculo.getModelo().getMarca();

            // Procura no banco se ela já existe
            Optional<Marca> marcaExistente = marcaRepository.findByNomeMarca(marcaDoJson.getNomeMarca());

            Marca marcaParaSalvar;
            if (marcaExistente.isPresent()) {
                // Se SIM: usamos a que já existe (com ID)
                marcaParaSalvar = marcaExistente.get();
            } else {
                // Se NÃO: é uma marca nova, então salvamos ela
                marcaParaSalvar = marcaRepository.save(marcaDoJson);
            }

            // Atualiza o Modelo com a Marca correta (agora gerenciada pelo JPA)
            veiculo.getModelo().setMarca(marcaParaSalvar);

            // Salvar o Veículo no banco
            Veiculo veiculoSalvo = veiculoRepository.save(veiculo);

            return ResponseEntity.status(201).body(veiculoSalvo); // 201 Created

        } catch (Exception e) {
            e.printStackTrace(); // Ótimo para depurar
            return ResponseEntity.status(400).build(); // 400 Bad Request
        }
    }
    @PutMapping("/editar/{id}")
    public ResponseEntity<Veiculo> atualizarVeiculo(
            @PathVariable Integer id,
            @RequestParam(value = "imagens", required = false) List<MultipartFile> novasImagens,
            @RequestParam("veiculoJson") String veiculoJson) {

        try {
            // --- Buscar o Veículo Existente ---
            // Buscam o veículo que já existe no banco
            Veiculo veiculoExistente = veiculoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Veículo não encontrado com id: " + id));

            // ---  Converte o JSON com os dados atualizados ---
            Veiculo veiculoAtualizado = objectMapper.readValue(veiculoJson, Veiculo.class);

            // Lógica "Find or Create"  ---

            // Proprietario (Baseado no Email)
            Proprietario propDoJson = veiculoAtualizado.getProprietario();
            Optional<Proprietario> proprietarioExistenteOpt = proprietarioRepository.findByEmail(propDoJson.getEmail());

            Proprietario propParaSalvar;

            if (proprietarioExistenteOpt.isPresent()) {
                // Se o proprietário EXISTE, atualiza seus dados
                propParaSalvar = proprietarioExistenteOpt.get();

                // Copia os dados do formulário (JSON) para o objeto do banco
                propParaSalvar.setNomeProprietario(propDoJson.getNomeProprietario());
                propParaSalvar.setTelefone(propDoJson.getTelefone());

                // Estes são os campos do mapa que SÃO salvos
                propParaSalvar.setCidade(propDoJson.getCidade());
                propParaSalvar.setEstado(propDoJson.getEstado());
                propParaSalvar.setLatitude(propDoJson.getLatitude());
                propParaSalvar.setLongitude(propDoJson.getLongitude());

                // Salva as mudanças no proprietário existente
                propParaSalvar = proprietarioRepository.save(propParaSalvar);

            } else {
                // Se NÃO existe, salva o novo proprietário que veio do JSON
                propParaSalvar = proprietarioRepository.save(propDoJson);
            }

            // Marca (Baseado no Nome)
            Marca marcaDoJson = veiculoAtualizado.getModelo().getMarca();
            Marca marcaParaSalvar = marcaRepository.findByNomeMarca(marcaDoJson.getNomeMarca())
                    .orElseGet(() -> marcaRepository.save(marcaDoJson));

            // --- Atualizar os Dados do Veículo ---

            veiculoExistente.getModelo().setNomeModelo(veiculoAtualizado.getModelo().getNomeModelo());
            veiculoExistente.getModelo().setMarca(marcaParaSalvar);

            veiculoExistente.setProprietario(propParaSalvar);
            veiculoExistente.setCategoria(veiculoAtualizado.getCategoria()); // Categoria já vem com ID

            veiculoExistente.setAnoFabricacao(veiculoAtualizado.getAnoFabricacao());
            veiculoExistente.setAnoModelo(veiculoAtualizado.getAnoModelo());
            veiculoExistente.setPreco(veiculoAtualizado.getPreco());
            veiculoExistente.setQuilometragem(veiculoAtualizado.getQuilometragem());
            veiculoExistente.setCor(veiculoAtualizado.getCor());
            veiculoExistente.setDescricao(veiculoAtualizado.getDescricao());
            veiculoExistente.setPlaca(veiculoAtualizado.getPlaca());

            // --- Lidar com Novas Imagens ---
            // (Nota: Este código apenas ADICIONA novas imagens, não remove as antigas)
            if (novasImagens != null && !novasImagens.isEmpty()) {

                // Descobre qual é a última ordem de imagem
                int ordemAtual = veiculoExistente.getImagens().stream()
                        .mapToInt(ImagemVeiculo::getOrdem)
                        .max()
                        .orElse(-1); // Se não houver imagens, começa em -1

                for (MultipartFile arquivo : novasImagens) {
                    if (arquivo.isEmpty()) continue;

                    ordemAtual++; // Incrementa a ordem para a nova imagem

                    String nomeOriginal = arquivo.getOriginalFilename();
                    String extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                    String nomeUnico = UUID.randomUUID().toString() + extensao;

                    // Salva o arquivo no disco (usando java.nio.file)
                    Files.copy(arquivo.getInputStream(), Paths.get(caminhoUpload + nomeUnico));

                    String urlPublica = urlBase + nomeUnico;

                    ImagemVeiculo imagem = new ImagemVeiculo();
                    imagem.setUrlImagem(urlPublica);
                    imagem.setOrdem(ordemAtual);
                    imagem.setVeiculo(veiculoExistente); // Linka com o veículo existente

                    veiculoExistente.getImagens().add(imagem);
                }
            }

            // Salvar o Veículo Atualizado
            Veiculo veiculoSalvo = veiculoRepository.save(veiculoExistente);
            return ResponseEntity.ok(veiculoSalvo); // Retorna 200 OK

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(null); // 400 Bad Request
        }
    }

    @DeleteMapping("/imagens/{id}")
    public ResponseEntity<Void> excluirImagem(@PathVariable Integer id) {
        try {
            ImagemVeiculo imagem = imagemRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));


            try {
                String nomeArquivo = imagem.getUrlImagem().substring(urlBase.length());
                File arquivoParaApagar = new File(caminhoUpload + nomeArquivo);
                if (arquivoParaApagar.exists()) {
                    arquivoParaApagar.delete();
                }
            } catch (Exception e) {
                System.err.println("Falha ao apagar arquivo físico, mas o registro do banco será removido: " + e.getMessage());
            }

            imagemRepository.delete(imagem);

            return ResponseEntity.noContent().build(); // Sucesso (204 No Content)

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build(); // Erro (404 Not Found)
        }
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> excluirVeiculo(@PathVariable Integer id) {
        try {
            // 1. Primeiro, buscamos o veículo para saber quais imagens apagar
            Veiculo veiculo = veiculoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));

            // 2. Apagamos os arquivos físicos do servidor
            if (veiculo.getImagens() != null && !veiculo.getImagens().isEmpty()) {
                System.out.println("Iniciando exclusão de arquivos...");
                for (ImagemVeiculo imagem : veiculo.getImagens()) {
                    try {
                        // Extrai o nome do arquivo (ex: "uuid.jpg") da URL completa
                        String nomeArquivo = imagem.getUrlImagem().substring(urlBase.length());
                        File arquivoParaApagar = new File(caminhoUpload + nomeArquivo);

                        if (arquivoParaApagar.exists()) {
                            if (arquivoParaApagar.delete()) {
                                System.out.println("Arquivo apagado: " + nomeArquivo);
                            } else {
                                System.out.println("Falha ao apagar: " + nomeArquivo);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Erro ao tentar apagar arquivo: " + e.getMessage());
                        // Continua mesmo se um arquivo falhar
                    }
                }
            }

            // 3. Agora, apagamos o veículo do banco de dados
            // O 'ON DELETE CASCADE' do seu SQL vai apagar as linhas da
            // tabela 'imagem_veiculo' automaticamente.
            veiculoRepository.delete(veiculo);

            // Retorna 204 No Content (Sucesso, sem conteúdo)
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            e.printStackTrace();
            // Retorna 404 Not Found se o findById falhar
            return ResponseEntity.notFound().build();
        }
    }


}
