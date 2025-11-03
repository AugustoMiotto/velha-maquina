const API_URL = "http://26.122.130.40:8080/veiculos";

// --- Carregar destaques ---
async function carregarDestaques() {
  const container = document.getElementById("destaques-container");

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao carregar veículos.");

    const veiculos = await resposta.json();
    container.innerHTML = "";

    veiculos.slice(0, 6).forEach(v => {
      const link = document.createElement("a");
      link.href = `/velha-maquina/frontend/views/veiculo-detalhe.html?id=${v.id_veiculo}`;
      link.className = "destaque-link";

      const card = document.createElement("div");
      card.className = "carro-card";
      card.innerHTML = `
        <div class="imagem-container">
          <img src="${v.imagens?.[0]?.urlImagem || 'https://via.placeholder.com/300x200?text=Sem+Foto'}" alt="${v.modelo?.nomeModelo}">
        </div>
        <div class="carro-info">
          <h3>${v.modelo?.nomeModelo || 'Modelo desconhecido'}</h3>
          <p>${v.categoria?.nome_categoria || ''} | ${v.anoFabricacao || ''}</p>
          <a href="/velha-maquina/frontend/views/veiculo-detalhe.html?id=${v.id_veiculo}" class="btn-card">Ver Detalhes</a>
        </div>
      `;
      link.appendChild(card);
      container.appendChild(link);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p>Erro ao carregar destaques.</p>`;
  }
}

// --- Carrossel automático ---
function iniciarCarrossel() {
  const slides = document.querySelectorAll(".slide");
  let index = 0;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDestaques();
  iniciarCarrossel();
});
