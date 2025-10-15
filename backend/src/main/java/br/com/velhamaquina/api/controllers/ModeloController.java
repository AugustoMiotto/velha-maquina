package br.com.velhamaquina.api.controllers;


import br.com.velhamaquina.api.models.Modelo;
import br.com.velhamaquina.api.repositories.ModeloRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ModeloController {
    private final ModeloRepository modeloRepository;

    public ModeloController(ModeloRepository modeloRepository) {
        this.modeloRepository = modeloRepository;
    }

    @GetMapping("/modelos")
    public List<Modelo> buscarModelo(){
        return modeloRepository.findAll();
    }
}
