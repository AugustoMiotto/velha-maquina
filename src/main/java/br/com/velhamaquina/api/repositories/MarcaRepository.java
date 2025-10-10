package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {

}
