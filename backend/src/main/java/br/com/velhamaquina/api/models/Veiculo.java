package br.com.velhamaquina.api.models;


import jakarta.persistence.*;

import java.util.Date;
import java.util.List;


@Entity
@Table(name = "veiculo")
public class Veiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_veiculo;

    @ManyToOne(fetch = FetchType.EAGER) // <-- MUDE AQUI
    @JoinColumn(name = "id_modelo")
    private Modelo modelo;

    @ManyToOne(fetch = FetchType.EAGER) // <-- MUDE AQUI
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.EAGER) // <-- MUDE AQUI
    @JoinColumn(name = "id_proprietario")
    private Proprietario proprietario;

    @Column(name = "ano_fabricacao")
    private int anoFabricacao;

    @Column(name = "ano_modelo")
    private Integer anoModelo;

    private double preco;
    private int quilometragem;
    private String cor;
    private String descricao;
    private String placa;

    @Column(name = "data_cadastro")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dataCadastro;

    private String status;

    @OneToMany(
            mappedBy = "veiculo", // "veiculo" é o nome do campo na classe ImagemVeiculo
            cascade = CascadeType.ALL, // Se deletar um Veiculo, deleta suas imagens
            fetch = FetchType.EAGER
    )
    @OrderBy("ordem ASC") // Sempre trará a lista ordenada (imagem 0, 1, 2...)
    private List<ImagemVeiculo> imagens;

    public Veiculo() {
    }

    public Veiculo(Modelo modelo, Categoria categoria, Proprietario proprietario,
                   int anoFabricacao, Integer anoModelo, double preco, int quilometragem,
                   String cor, String descricao, String placa, Date dataCadastro, String status) {
        this.modelo = modelo;
        this.categoria = categoria;
        this.proprietario = proprietario;
        this.anoFabricacao = anoFabricacao;
        this.anoModelo = anoModelo;
        this.preco = preco;
        this.quilometragem = quilometragem;
        this.cor = cor;
        this.descricao = descricao;
        this.placa = placa;
        this.dataCadastro = dataCadastro;
        this.status = status;
    }

    public Integer getId_veiculo() {
        return id_veiculo;
    }

    public Modelo getModelo() {
        return modelo;
    }

    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Proprietario getProprietario() {
        return proprietario;
    }

    public void setProprietario(Proprietario proprietario) {
        this.proprietario = proprietario;
    }

    public int getAnoFabricacao() {
        return anoFabricacao;
    }

    public void setAnoFabricacao(int anoFabricacao) {
        this.anoFabricacao = anoFabricacao;
    }

    public Integer getAnoModelo() {
        return anoModelo;
    }

    public void setAnoModelo(Integer anoModelo) {
        this.anoModelo = anoModelo;
    }

    public double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

    public int getQuilometragem() {
        return quilometragem;
    }

    public void setQuilometragem(int quilometragem) {
        this.quilometragem = quilometragem;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public Date getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Date dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<ImagemVeiculo> getImagens() {
        return imagens;
    }

    public void setImagens(List<ImagemVeiculo> imagens) {
        this.imagens = imagens;
    }

}
