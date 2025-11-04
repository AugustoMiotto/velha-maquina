package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.ImagemVeiculo;
import br.com.velhamaquina.api.models.Marca;
import br.com.velhamaquina.api.models.Veiculo;
import br.com.velhamaquina.api.models.Proprietario;
import br.com.velhamaquina.api.repositories.ProprietarioRepository;
import br.com.velhamaquina.api.repositories.VeiculoRepository;
import br.com.velhamaquina.api.repositories.MarcaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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


    @Value("${upload.diretorio.imagens}")
    private String caminhoUpload;

    @Value("${upload.url-base}")
    private String urlBase;

    public VeiculoController(VeiculoRepository veiculoRepository, ObjectMapper objectMapper, MarcaRepository marcaRepository, ProprietarioRepository proprietarioRepository) {
        this.veiculoRepository = veiculoRepository;
        this.objectMapper = objectMapper;
        this.marcaRepository = marcaRepository;
        this.proprietarioRepository = proprietarioRepository;
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
}
