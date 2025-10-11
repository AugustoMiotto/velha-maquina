package br.com.velhamaquina.api.controllers;


import br.com.velhamaquina.api.models.Proprietario;
import br.com.velhamaquina.api.repositories.ProprietarioRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProprietarioController {
    private final ProprietarioRepository proprietarioRepository;

    public ProprietarioController(ProprietarioRepository proprietarioRepository) {
        this.proprietarioRepository = proprietarioRepository;
    }
    @GetMapping("/proprietarios")
    public List<Proprietario> buscarProprietario(){
        return proprietarioRepository.findAll();
    }
}
