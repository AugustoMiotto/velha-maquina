package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.Veiculo;
import br.com.velhamaquina.api.repositories.VeiculoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class VeiculoController {
    private final VeiculoRepository  veiculoRepository;

    public VeiculoController(VeiculoRepository veiculoRepository) {
        this.veiculoRepository = veiculoRepository;
    }

    @GetMapping("/veiculos")
    public List<Veiculo> buscarVeiculos(){
        return veiculoRepository.findAll();
    }
}
