package br.com.velhamaquina.api.repositories;


import br.com.velhamaquina.api.models.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModeloRepository extends JpaRepository<Modelo,Integer> {
}
