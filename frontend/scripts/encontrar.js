// /frontend/scripts/encontrar.js
const API_URL = "http://26.122.130.40:8080/veiculos";
let mapa;
let marcadores = [];

/* Inicializa o mapa */
function inicializarMapa() {
  mapa = L.map("mapa").setView([-15.78, -47.93], 5); // centro do Brasil
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapa);
}

/* Carrega veículos e exibe no mapa */
async function carregarVeiculos(filtro = "") {
  const lista = document.getElementById("lista-veiculos");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error("Falha ao buscar veículos");
    const veiculos = await resp.json();

    // Filtro por modelo, categoria ou cidade
    const filtrados = veiculos.filter((v) =>
      (v.modelo?.nomeModelo || "").toLowerCase().includes(filtro.toLowerCase()) ||
      (v.categoria?.nome_categoria || "").toLowerCase().includes(filtro.toLowerCase()) ||
      (v.proprietario?.cidade || "").toLowerCase().includes(filtro.toLowerCase())
    );

    lista.innerHTML = "";
    marcadores.forEach((m) => mapa.removeLayer(m));
    marcadores = [];

    if (filtrados.length === 0) {
      lista.innerHTML = "<p>Nenhum anúncio encontrado.</p>";
      return;
    }

    filtrados.forEach((v) => {
      const lat = v.proprietario?.latitude;
      const lon = v.proprietario?.longitude;

      // Cria marcador apenas se houver coordenadas válidas
      if (lat && lon && lat !== 0 && lon !== 0) {
        try {
          const marker = L.marker([lat, lon]).addTo(mapa);
          marker.bindPopup(`
            <b>${v.modelo?.nomeModelo || "Modelo desconhecido"}</b><br>
            ${v.proprietario?.cidade || ""} - ${v.proprietario?.estado || ""}<br>
            <strong>R$ ${v.preco?.toLocaleString("pt-BR")}</strong><br>
            <a href="/velha-maquina/frontend/views/veiculo-detalhe.html?id=${v.id_veiculo}">Ver detalhes</a>
          `);
          marcadores.push(marker);
        } catch (e) {
          console.warn("Erro ao adicionar marcador para veículo", v.id_veiculo, e);
        }
      } else {
        // fallback: tenta geocodificar cidade/estado se não tiver coordenadas
        (async () => {
          const endereco = `${v.proprietario?.cidade || ""} ${v.proprietario?.estado || ""}`;
          if (!endereco.trim()) return;

          try {
            const geoResp = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco + ", Brasil")}`
            );
            const dadosGeo = await geoResp.json();

            if (dadosGeo.length > 0) {
              const { lat, lon } = dadosGeo[0];
              const marker = L.marker([lat, lon]).addTo(mapa);
              marker.bindPopup(`
                <b>${v.modelo?.nomeModelo || "Modelo desconhecido"}</b><br>
                ${endereco}<br>
                <strong>R$ ${v.preco?.toLocaleString("pt-BR")}</strong><br>
                <a href="/velha-maquina/frontend/views/veiculo-detalhe.html?id=${v.id_veiculo}">Ver detalhes</a>
              `);
              marcadores.push(marker);
            }
          } catch (err) {
            console.warn("Geocoding fallback falhou para", v.id_veiculo, err);
          }
        })();
      }

      // Cria card na lista lateral
      const enderecoTexto = `${v.proprietario?.cidade || ""} ${v.proprietario?.estado || ""}`;
      const card = document.createElement("div");
      card.className = "veiculo-card";
      card.innerHTML = `
        <img src="${v.imagens?.[0]?.urlImagem || "https://via.placeholder.com/300x200?text=Sem+Imagem"}" alt="${v.modelo?.nomeModelo}">
        <div class="veiculo-info">
          <h3>${v.modelo?.nomeModelo || "Modelo desconhecido"}</h3>
          <p>${v.categoria?.nome_categoria || ""} - ${enderecoTexto}</p>
          <p><strong>R$ ${v.preco?.toLocaleString("pt-BR")}</strong></p>
          <a href="/velha-maquina/frontend/views/veiculo-detalhe.html?id=${v.id_veiculo}" class="btn-ver">Ver Detalhes</a>
        </div>
      `;
      lista.appendChild(card);
    });

    // Centraliza mapa nos marcadores
    if (marcadores.length === 1) {
      mapa.setView(marcadores[0].getLatLng(), 14);
    } else if (marcadores.length > 1) {
      const grupo = L.featureGroup(marcadores);
      mapa.fitBounds(grupo.getBounds());
    }
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Erro ao carregar anúncios.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
  carregarVeiculos();

  document.getElementById("btn-filtrar").addEventListener("click", () => {
    const valor = document.getElementById("busca").value.trim();
    carregarVeiculos(valor);
  });
});
