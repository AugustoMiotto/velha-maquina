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

/**
 * Pega o texto alternativo da imagem principal.
 * Se não houver, usa o nome do modelo.
 */
function getAltTexto(veiculo) {
    if (veiculo.imagens && veiculo.imagens.length > 0 && veiculo.imagens[0].altTexto) {
        return veiculo.imagens[0].altTexto;
    }
    // CORRIGIDO: Usar nomeModelo aqui também
    return veiculo.modelo?.nomeModelo || 'Veículo antigo'; 
}

/**
 * Função principal para carregar os veículos
 */
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
            const card = document.createElement('div');
            card.className = 'carro-card';
            
            // Verificações de nome de variável corrigidas
            card.innerHTML = `
                <img src="${getImagemPrincipal(v)}" alt="${getAltTexto(v)}">
                <div class="carro-info">
                    <h2>${v.modelo?.nomeModelo || 'Modelo desconhecido'}</h2>
                    <p><strong>Categoria:</strong> ${v.categoria?.nome_categoria || 'Sem categoria'}</p>
                    <p><strong>Ano de fabricação:</strong> ${v.anoFabricacao}</p>
                    <p><strong>Ano do modelo:</strong> ${v.anoModelo || '—'}</p>
                    <p><strong>Cor:</strong> ${v.cor || 'Não informada'}</p>
                    <p><strong>Descrição:</strong> ${v.descricao || 'Sem descrição disponível'}</p>
                    <p class="carro-preco">R$ ${v.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'Sob consulta'}</p>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar veículos:", erro);
        container.innerHTML = "<p>Erro ao carregar os veículos. Tente novamente mais tarde.</p>";
    }
}

// Inicia a função quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", carregarVeiculos);