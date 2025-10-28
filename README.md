
# 🚗 Velha Máquina - Marketplace de Veículos Antigos

Status do Projeto: `Em Desenvolvimento 🚧`

Projeto acadêmico de um marketplace focado na exibição e venda de veículos antigos. O sistema é dividido entre uma API REST (feita em Java/Spring) e um sistema de cadastro (feito em Python) que alimentam um front-end web.

A parte python ainda não está disponível no github!!!

## 📝 Sobre o Projeto

Este é um projeto acadêmico interdisciplinar, onde diferentes equipes são responsáveis por partes distintas do sistema:

  * **API REST:** Desenvolvida em Java com Spring Boot, responsável por expor os dados dos veículos para o front-end.
  * **Front-End Web:** Desenvolvido em HTML, CSS e JavaScript, consome esta API para exibir os anúncios.
  * **Sistema de Cadastro (Back-office):** Um sistema em Python responsável por popular o banco de dados com novos veículos e proprietários.

### Funcionalidades Principais

  * API REST completa para consulta de veículos, marcas, modelos, categorias e proprietários.
  * Sistema de relacionamentos complexos (Veículo se relaciona com Modelo, Categoria e Proprietário).
  * Configuração de segurança para não expor dados sensíveis (senhas de banco) no GitHub, usando `application-dev.properties` e `.gitignore`.
  * Estrutura de geolocalização pronta para ser consumida (latitude e longitude no proprietário) para filtros de proximidade.

## 🛠️ Tecnologias Utilizadas

  * **API (Back-end):**
      * Java 17
      * Spring Boot
      * Spring Web
      * Spring Data JPA
      * Maven
  * **Banco de Dados:**
      * MySQL 8
        
* **Front-End:**
    * HTML
    * JavaScript
    * BootStrap
    * CSS

## 🚀 Como Rodar a API

Siga os passos abaixo para executar a API REST localmente.

### Pré-requisitos

  * JDK 17 ou superior
  * Maven 3.x
  * Um servidor MySQL rodando (na porta padrão `3306`)

### Instalação

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/AugustoMiotto/velha-maquina.git
    cd velha-maquina
    ```

2.  **Crie o Banco de Dados:**

      * Abra seu cliente MySQL e crie o banco de dados:
        ```sql
        CREATE DATABASE velha_maquina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```
      * Execute o script `schema.sql` (disponibilizado abaixo) para criar todas as tabelas.

3.  **Configure a Conexão Local:**

      * Na pasta `src/main/resources/`, crie o arquivo `application-dev.properties`.
      * Cole o conteúdo abaixo nele, **substituindo `seu_usuario` e `sua_senha`** pelas suas credenciais do MySQL:
        ```properties
        # Configuração do Banco de Dados MySQL
        spring.datasource.url=jdbc:mysql://localhost:3306/velha_maquina
        spring.datasource.username=seu_usuario
        spring.datasource.password=sua_senha

        # Estratégia do Hibernate
        spring.jpa.hibernate.ddl-auto=update
        ```
      * O arquivo `.gitignore` já está configurado para **não** enviar este arquivo para o GitHub.

4.  **Execute a Aplicação:**

      * Você pode rodar pelo seu IntelliJ (clicando "play" na classe `ApiApplication.java`) ou via terminal:
        ```bash
        ./mvnw spring-boot:run
        ```
      * A API estará disponível em `http://localhost:8080`.

## 📂 Estrutura do Banco de Dados (`velha-maquina.sql`)

  *O Arquivo SQL está disponível nos arquivos do projeto.

## 🗺️ Endpoints da API

Abaixo estão os principais endpoints disponíveis para consulta.

| Método | URL | Descrição | Exemplo de Retorno |
| :--- | :--- | :--- | :--- |
| `GET` | `/marcas` | Retorna uma lista de todas as marcas. | `[{"id":1,"nome":"Ford"}]` |
| `GET` | `/categorias` | Retorna uma lista de todas as categorias. | `[{"id":1,"nome":"Antigo"}]` |
| `GET` | `/modelos` | Retorna uma lista de todos os modelos. | `[{"id":1,"nome":"Mustang","marca":{...}}]` |
| `GET` | `/proprietarios`| Retorna uma lista de todos os proprietários. | `[{"id":1,"nome":"João da Silva",...}]` |
| `GET` | `/veiculos` | Retorna a lista completa de veículos. | `[{"id":1,"anoFabricacao":1967,...,"modelo":{...}}]` |

## 👨‍💻 Autores

  * **Equipe API/Web (4º Semestre)**
      * Augusto Miotto
      * Vinicius F. De Souza
      * Eric Cristani
  

-----
