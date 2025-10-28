package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.Veiculo;
import br.com.velhamaquina.api.repositories.VeiculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/veiculos")
public class VeiculoController {
    private final VeiculoRepository  veiculoRepository;

    public VeiculoController(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
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
    public Veiculo salvarVeiculo(@RequestBody Veiculo veiculo){
        Veiculo veiculoSalvo = veiculoRepository.save(veiculo);

        // Retorna o veículo salvo (com todos os IDs) e um status 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(veiculoSalvo).getBody();
    }
}
