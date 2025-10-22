// /velha-maquina/frontend/scripts/home.js

const API_URL = "http://localhost:8080/veiculos";

/**
 * Pega a URL da imagem principal do veículo.
 * Se não houver imagem, retorna um placeholder.
 */
function getImagemPrincipal(veiculo) {
    if (veiculo.imagens && veiculo.imagens.length > 0) {
        // A lista de imagens já vem ordenada (ordem: 0 primeiro)
        return veiculo.imagens[0].urlImagem; 
    }
    // Um placeholder 
    return "https://via.placeholder.com/300x200?text=Sem+Foto"; 
}

async function carregarVeiculos() {
    const container = document.getElementById("carros-container");

    try {
        // Adiciona um parâmetro "cache-bust" para enganar o navegador e forçar
        // uma nova requisição da API.
        const resposta = await fetch(API_URL + '?t=' + new Date().getTime());

        if (!resposta.ok) throw new Error("Erro ao buscar dados da API");

        const veiculos = await resposta.json();

        if (veiculos.length === 0) {
            container.innerHTML = "<p>Nenhum veículo encontrado.</p>";
            return;
        }

        // Limpa o container antes de adicionar novos
        container.innerHTML = ""; 

        // Gera o HTML para cada veículo
       veiculos.forEach(v => {
            // Criamos o <a> (link) primeiro
            const link = document.createElement('a');
            // O link aponta para a nova página e passa o ID na URL
            link.href = `veiculo-detalhe.html?id=${v.id_veiculo}`; 
            link.className = 'carro-card-link'; // Classe para estilização (opcional)

            // Criamos o card (como você já fazia)
            const card = document.createElement('div');
            card.className = 'carro-card';
            
            // O HTML de antes (agora com a imagem certa)
            card.innerHTML = `
                <img src="${getImagemPrincipal(v)}" 
                     alt="Imagem do ${v.modelo?.nomeModelo || 'veículo'}" 
                     class="carro-imagem"/>
                <div class="carro-info">
                    <h2>${v.modelo?.nomeModelo || 'Modelo desconhecido'}</h2>
                    <p><strong>Categoria:</strong> ${v.categoria?.nome_categoria || 'Sem categoria'}</p>
                    <p><strong>Ano de fabricação:</strong> ${v.anoFabricacao}</p>
                    <p class="carro-preco">R$ ${v.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'Sob consulta'}</p>
                </div>
            `;
            
            // Colocamos o card DENTRO do link
            link.appendChild(card);
            // Adicionamos o link (com o card dentro) ao container
            container.appendChild(link);
        });

    } catch (erro) {
        console.error("Erro ao carregar veículos:", erro);
        container.innerHTML = "<p>Erro ao carregar os veículos. Tente novamente mais tarde.</p>";
    }
}

// Inicia a função quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", carregarVeiculos);