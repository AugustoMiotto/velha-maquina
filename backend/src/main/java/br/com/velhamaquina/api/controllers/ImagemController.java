package br.com.velhamaquina.api.controllers;



import br.com.velhamaquina.api.models.ImagemVeiculo;
import br.com.velhamaquina.api.repositories.ImagemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ImagemController {
    private final ImagemRepository imagemRepository;

    public ImagemController(ImagemRepository imagemRepository) {
        this.imagemRepository = imagemRepository;
    }
    @GetMapping("/imagens")
    public List<ImagemVeiculo> buscarImagens(){
        return imagemRepository.findAll();
    }
}
