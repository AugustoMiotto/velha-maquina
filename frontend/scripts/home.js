const API_URL = "http://localhost:8080/veiculos";

async function carregarVeiculos() {
  const container = document.getElementById("carros-container");

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao buscar dados da API");

    const veiculos = await resposta.json();

    if (veiculos.length === 0) {
      container.innerHTML = "<p>Nenhum veículo encontrado.</p>";
      return;
    }

    container.innerHTML = veiculos.map(v => `
      <div class="carro-card">
        <img src="https://via.placeholder.com/300x200?text=${encodeURIComponent(v.modelo?.nome || 'Carro Antigo')}" alt="${v.modelo?.nome || 'Veículo'}">
        <div class="carro-info">
          <h2>${v.modelo?.nome || 'Modelo desconhecido'}</h2>
          <p><strong>Categoria:</strong> ${v.categoria?.nome || 'Sem categoria'}</p>
          <p><strong>Ano de fabricação:</strong> ${v.anoFabricacao}</p>
          <p><strong>Ano do modelo:</strong> ${v.anoModelo || '—'}</p>
          <p><strong>Cor:</strong> ${v.cor}</p>
          <p><strong>Descrição:</strong> ${v.descricao || 'Sem descrição disponível'}</p>
          <p class="carro-preco">R$ ${v.preco?.toLocaleString('pt-BR') || 'Sob consulta'}</p>
        </div>
      </div>
    `).join('');

  } catch (erro) {
    console.error(erro);
    container.innerHTML = "<p>Erro ao carregar os veículos. Tente novamente mais tarde.</p>";
  }
}

document.addEventListener("DOMContentLoaded", carregarVeiculos);
