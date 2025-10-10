package br.com.velhamaquina.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "modelo")
public class Modelo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_modelo;
    private String nome_modelo;
    @ManyToOne
    @JoinColumn(name = "id_marca")
    private Marca id_marca;

    public Modelo (){}

    public Modelo(String nome_modelo, Marca id_marca) {
        this.nome_modelo = nome_modelo;
        this.id_marca = id_marca;
    }

    public Integer getId_modelo() {
        return id_modelo;
    }

    public String getNome_modelo() {
        return nome_modelo;
    }

    public void setNome_modelo(String nome_modelo) {
        this.nome_modelo = nome_modelo;
    }

    public Marca getId_marca() {
        return id_marca;
    }

    public void setId_marca(Marca id_marca) {
        this.id_marca = id_marca;
    }
}
