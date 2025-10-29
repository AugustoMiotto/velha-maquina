package br.com.velhamaquina.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "marca")
public class Marca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_marca;

    @Column(name = "nome_marca")
    private String nomeMarca;

    public Marca() {
    }

    public Marca(String nome_marca) {
        this.nomeMarca = nome_marca;
    }

    public int getId() {
        return id_marca;
    }


    public String getNomeMarca() {
        return nomeMarca;
    }

    public void setNomeMarca(String nome_marca) {
        this.nomeMarca = nome_marca;
    }
}
