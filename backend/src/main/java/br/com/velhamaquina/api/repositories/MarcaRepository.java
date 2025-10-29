package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {

    Optional<Marca> findByNomeMarca(String nomeMarca);
}
