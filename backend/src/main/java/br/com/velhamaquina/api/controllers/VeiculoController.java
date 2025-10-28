package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.ImagemVeiculo;
import br.com.velhamaquina.api.models.Veiculo;
import br.com.velhamaquina.api.repositories.VeiculoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/veiculos")
public class VeiculoController {
    private final VeiculoRepository  veiculoRepository;
    private final ObjectMapper objectMapper;

    @Value("${upload.diretorio.imagens}")
    private String caminhoUpload;

    @Value("${upload.url-base}")
    private String urlBase;

    public VeiculoController(VeiculoRepository veiculoRepository, ObjectMapper objectMapper) {
        this.veiculoRepository = veiculoRepository;
        this.objectMapper = objectMapper;
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

            // 4. Salvar o Veículo no banco
            // Graças ao CascadeType.ALL, isso salvará o Veiculo,
            // o novo Proprietario E a nova List<ImagemVeiculo> de uma só vez.
            Veiculo veiculoSalvo = veiculoRepository.save(veiculo);

            return ResponseEntity.status(201).body(veiculoSalvo); // 201 Created

        } catch (Exception e) {
            e.printStackTrace(); // Ótimo para depurar
            return ResponseEntity.status(400).build(); // 400 Bad Request
        }
    }
}
