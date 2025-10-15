package br.com.velhamaquina.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "modelo")
public class Modelo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "id_modelo")
    private Integer idModelo;

    @Column(name = "nome_modelo")
    private String nomeModelo;
    @ManyToOne
    @JoinColumn(name = "id_marca")
    private Marca marca;

    public Modelo (){}

    public Modelo(String nomeModelo, Marca marca) {
        this.nomeModelo = nomeModelo;
        this.marca = marca;
    }

    public Integer getIdModelo() {
        return idModelo;
    }

    public String getNomeModelo() {
        return nomeModelo;
    }

    public void setNome_modelo(String nomeModelo) {
        this.nomeModelo = nomeModelo;
    }

    public Marca getmarca() {
        return marca;
    }

    public void setId_marca(Marca marca) {
        this.marca = marca;
    }
}
