package br.com.velhamaquina.api.controllers;

import br.com.velhamaquina.api.models.Categoria;
import br.com.velhamaquina.api.repositories.CategoriaRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("categorias")
    public List<Categoria> buscarCategoria (){
        return categoriaRepository.findAll();
    }
}
