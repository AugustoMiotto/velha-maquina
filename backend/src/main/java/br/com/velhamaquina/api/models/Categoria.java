package br.com.velhamaquina.api.models;

import jakarta.persistence.*;

@Entity
@Table(name="categoria")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_categoria;

    private String nome_categoria;

    public Categoria(){}

    public Categoria( String nome_categoria) {
        this.id_categoria = id_categoria;
        this.nome_categoria = nome_categoria;
    }

    public Integer getId_categoria() {
        return id_categoria;
    }

    public String getNome_categoria() {
        return nome_categoria;
    }

    public void setNome_categoria(String nome_categoria) {
        this.nome_categoria = nome_categoria;
    }
}
