-- Arquivo para inserir dados falsos nas tabelas--
use velha_maquina;

INSERT INTO marca (nome_marca) VALUES ('Ford');
INSERT INTO marca (nome_marca) VALUES ('Chevrolet');

INSERT INTO modelo (nome_modelo, id_marca) VALUES ('Mustang', 1);
INSERT INTO modelo (nome_modelo, id_marca) VALUES ('Opala',2);

-- Inserindo Proprietários (IDs serão 1 e 2)
INSERT INTO proprietario (nome_proprietario, email, telefone, cidade, estado, latitude, longitude) VALUES 
('João da Silva', 'joao.silva@email.com', '(11) 98765-4321', 'São Paulo', 'SP', -23.550520, -46.633308),
('Velha Máquina - Estoque', 'contato@velhamaquina.com', '(41) 3333-4444', 'Curitiba', 'PR', -25.428954, -49.267137);


-- Inserindo Veículos, usando os IDs de tudo que criamos
INSERT INTO veiculo (id_proprietario, id_modelo, id_categoria, ano_fabricacao, ano_modelo, preco, quilometragem, cor, descricao, placa, status) VALUES
(
    1, -- Dono: João da Silva (ID 1)
    1, -- Modelo: Mustang (ID 1)
    3, -- Categoria: Antigo Novo (ID 3)
    1967, 1967, 350000.00, 55000, 'Vermelho', 'Ford Mustang Fastback, motor V8. Ícone americano.', 'ABC1D23', 'Disponível'
);

INSERT INTO veiculo (id_proprietario, id_modelo, id_categoria, ano_fabricacao, ano_modelo, preco, quilometragem, cor, descricao, placa, status) VALUES
(
    2, -- Dono: Velha Máquina - Estoque (ID 2)
    2, -- Modelo: Opala (ID 2)
    2, -- Categoria: Antigo (ID 2)
    1979, 1979, 85000.00, 98000, 'Prata', 'Chevrolet Opala Comodoro, 6 cilindros. Um clássico nacional.', 'DEF4E56', 'Disponível'
);