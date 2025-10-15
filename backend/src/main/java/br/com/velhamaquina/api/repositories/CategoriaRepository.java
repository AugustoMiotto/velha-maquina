package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}
