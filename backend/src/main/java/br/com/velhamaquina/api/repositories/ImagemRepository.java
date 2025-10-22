package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.ImagemVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImagemRepository extends JpaRepository<ImagemVeiculo, Integer> {

}
