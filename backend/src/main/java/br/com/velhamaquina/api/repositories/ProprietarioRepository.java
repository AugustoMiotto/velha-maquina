package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.Proprietario;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProprietarioRepository extends JpaRepository<Proprietario, Integer> {
}
