package br.com.velhamaquina.api.repositories;

import br.com.velhamaquina.api.models.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo,Integer> {
}
