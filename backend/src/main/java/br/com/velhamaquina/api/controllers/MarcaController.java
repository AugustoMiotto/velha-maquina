package br.com.velhamaquina.api.controllers;


import br.com.velhamaquina.api.models.Marca;
import br.com.velhamaquina.api.repositories.MarcaRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MarcaController {
    private final MarcaRepository marcaRepository;

    @GetMapping("/marcas")
    public  List<Marca> buscarMarcas(){
       return marcaRepository.findAll();
    }

    public MarcaController(MarcaRepository marcaRepository){
        this.marcaRepository = marcaRepository;
    }

}
