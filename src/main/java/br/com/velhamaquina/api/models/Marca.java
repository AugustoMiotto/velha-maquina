package br.com.velhamaquina.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "marca")
public class Marca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_marca;
    private String nome_marca;

    public Marca() {
    }

    public Marca(String nome_marca) {
        this.nome_marca = nome_marca;
    }

    public int getId() {
        return id_marca;
    }


    public String getNome_marca() {
        return nome_marca;
    }

    public void setNome_marca(String nome_marca) {
        this.nome_marca = nome_marca;
    }
}
