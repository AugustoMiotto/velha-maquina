package br.com.velhamaquina.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "imagem_veiculo")
public class ImagemVeiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_imagem;

    @Column(name = "url_imagem", nullable = false)
    private String urlImagem;

    @Column(name = "ordem")
    private Integer ordem;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veiculo", nullable = false)
    @JsonIgnore
    private Veiculo veiculo;

    public ImagemVeiculo() {
    }

    public ImagemVeiculo(String urlImagem, Integer ordem, Veiculo veiculo) {
        this.urlImagem = urlImagem;
        this.ordem = ordem;
        this.veiculo = veiculo;
    }


    public Integer getId_imagem() {
        return id_imagem;
    }

    public void setId_imagem(Integer id_imagem) {
        this.id_imagem = id_imagem;
    }

    public String getUrlImagem() {
        return urlImagem;
    }

    public void setUrlImagem(String urlImagem) {
        this.urlImagem = urlImagem;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }
}
