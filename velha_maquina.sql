CREATE DATABASE velha_maquina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE velha_maquina;

-- Tabela de Proprietários 
CREATE TABLE proprietario (
    id_proprietario INT AUTO_INCREMENT PRIMARY KEY,
    nome_proprietario VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cidade VARCHAR(100),
    estado VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
) ENGINE=InnoDB;

-- Tabela de Marcas 
CREATE TABLE marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nome_marca VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabela de Modelos 
CREATE TABLE modelo (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    nome_modelo VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL,
    FOREIGN KEY (id_marca) REFERENCES marca(id_marca)
) ENGINE=InnoDB;

-- Tabela de Categorias
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabela de Veículos 
CREATE TABLE veiculo (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_proprietario INT NOT NULL,
    id_modelo INT NOT NULL,
    id_categoria INT NOT NULL,
    ano_fabricacao INT NOT NULL,
    ano_modelo INT NOT NULL,
    nome_veiculo varchar (50),
    preco DECIMAL(10, 2) NOT NULL,
    quilometragem INT DEFAULT 0,
    cor VARCHAR(50),
    descricao TEXT,
    placa VARCHAR(10) UNIQUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Disponível', 'Vendido') DEFAULT 'Disponível',
    FOREIGN KEY (id_proprietario) REFERENCES proprietario(id_proprietario),
    FOREIGN KEY (id_modelo) REFERENCES modelo(id_modelo),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
) ENGINE=InnoDB;

-- Tabela de Imagens dos Veículos 
CREATE TABLE imagem_veiculo (
    id_imagem INT AUTO_INCREMENT PRIMARY KEY,
    id_veiculo INT NOT NULL,
    url_imagem VARCHAR(512) NOT NULL,
    ordem INT DEFAULT 0,    -- Para ordenar a galeria (0 = principal, 1, 2, 3...)

    -- Chave estrangeira ligando a imagem ao veículo
    FOREIGN KEY (id_veiculo) REFERENCES veiculo(id_veiculo)
        ON DELETE CASCADE -- Se um veículo for deletado, suas imagens também serão.
) ENGINE=InnoDB;


-- Inserindo as categorias iniciais para facilitar o trabalho
INSERT INTO categoria (nome_categoria) VALUES ('Antigo Velho');
INSERT INTO categoria (nome_categoria) VALUES ('Antigo');
INSERT INTO categoria (nome_categoria) VALUES ('Antigo Novo');

