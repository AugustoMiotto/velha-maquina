// /frontend/scripts/encontrar.js
const API_URL = "http://26.122.130.40:8080/veiculos";
let mapa;
let marcadores = [];

function toTitleFromEmail(email){
  try{
    const local = String(email).split('@')[0] || '';
    const cleaned = local.replace(/[._-]+/g, ' ').trim();
    if (!cleaned) return '';
    return cleaned.replace(/\b\w/g, c => c.toUpperCase());
  }catch{ return ''; }
}
function pickOwnerName(vend = {}, n = {}){
  const candidates = [
    vend.nomeCompleto, vend.nome, vend.name, vend.fullName,
    n.nomeProprietario, n.proprietario_nome, n.nome_anunciante, n.responsavel
  ];
  for (const c of candidates){
    if (c && !/^\s*$/.test(c) && !/@/.test(c)) return c;
  }
  const em = vend.email || n.email || '';
  if (/@/.test(em)) return toTitleFromEmail(em);
  return '';
}


function buildMini(v) {
  const imagens = Array.isArray(v.imagens) ? v.imagens.map(i => i?.urlImagem).filter(Boolean) : [];

  // pega o objeto de proprietário (como vem do backend)
  const proprietario = v.proprietario || v.vendedor || v.anunciante || v.usuario || v.user || {};

  // agora, pegamos o nome EXATAMENTE do campo que o usuário digitou
  // no formulário de anunciar
  const nomeProprietario = proprietario.nome || v.nomeProprietario || v.nome || "";

  const descricao =
    v.descricao || v.descricaoVeiculo || v.descricao_anuncio ||
    v.descricaoAnuncio || v.observacoes || v.obs || "";

  return {
    id: v.id_veiculo,
    categoria: v.categoria?.nome_categoria || v.categoria || "",
    modelo: v.modelo?.nomeModelo || v.modelo || "",
    marca: v.modelo?.marca?.nomeMarca || v.marca || "",
    anoFabricacao: v.ano_fabricacao ?? v.anoFabricacao ?? v.ano ?? "",
    anoModelo: v.ano_modelo ?? v.anoModelo ?? "",
    preco: v.preco ?? v.valor ?? null,
    quilometragem: v.quilometragem ?? v.km ?? "",
    cor: v.cor || "",
    placa: v.placa || v.placaVeiculo || "",
    descricao,
    vendedor: {
      nome: nomeProprietario, // 🔥 aqui vai o nome exato do cadastro
      email: proprietario.email || v.email || "",
      telefone: proprietario.telefone || proprietario.whatsapp || proprietario.phone || "",
      cidade: proprietario.cidade || "",
      estado: proprietario.estado || ""
    },
    imagens
  };
}



function currencyBR(v) {
  if (v === undefined || v === null || v === "") return "—";
  try {
    const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : String(v);
  } catch { return String(v); }
}
function escHTML(s) {
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function jsonAttr(obj) {
  return JSON.stringify(obj).replace(/"/g, "&quot;");
}
// Base64 seguro para URL
function toB64(obj) {
  const s = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return encodeURIComponent(b64);
}
// Caminho relativo para o arquivo de detalhes
function detalhePath() {
  return location.pathname.replace(/[^/]+$/, 'veiculo-detalhe.html');
}
function hrefDetalhe(id, b64) {
  return `${detalhePath()}?id=${id}&data=${b64}`;
}

/* ===== Mapa ===== */
function inicializarMapa() {
  mapa = L.map("mapa").setView([-15.78, -47.93], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapa);
}

/* ===== Carregar veículos ===== */
async function carregarVeiculos(filtro = "") {
  const lista = document.getElementById("lista-veiculos");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error("Falha ao buscar veículos");
    const veiculos = await resp.json();

    const termo = filtro.toLowerCase();
    const filtrados = veiculos.filter((v) =>
      (v.modelo?.nomeModelo || "").toLowerCase().includes(termo) ||
      (v.categoria?.nome_categoria || "").toLowerCase().includes(termo) ||
      (v.proprietario?.cidade || "").toLowerCase().includes(termo)
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
      const mini = buildMini(v);
      const b64 = toB64(mini);
      const enderecoLinha = [mini.vendedor.cidade, mini.vendedor.estado].filter(Boolean).join(" / ");
      const href = hrefDetalhe(mini.id, b64);

      // Marcadores no mapa
      if (lat && lon && lat !== 0 && lon !== 0) {
        const marker = L.marker([lat, lon]).addTo(mapa);
        marker.bindPopup(`
          <b>${escHTML(mini.modelo || "Modelo desconhecido")}</b><br>
          ${escHTML(enderecoLinha)}<br>
          <strong>${escHTML(currencyBR(mini.preco))}</strong><br>
          <a class="btn-ver" data-id="${mini.id}" data-json="${jsonAttr(mini)}" href="${href}">Ver detalhes</a>
        `);
        marcadores.push(marker);
      }

      // Lista lateral enxuta
      const imgSrc = (v.imagens?.[0]?.urlImagem) || "/velha-maquina/frontend/assets/imagem1.png";
      const card = document.createElement("div");
      card.className = "veiculo-card";
      card.setAttribute("data-json", jsonAttr(mini));
      card.innerHTML = `
        <img src="${escHTML(imgSrc)}" alt="${escHTML(mini.modelo || "")}">
        <div class="veiculo-info">
          <h3>${escHTML(mini.modelo || "Modelo desconhecido")}</h3>
          <p>${escHTML(mini.categoria || "")} ${enderecoLinha ? "• " + escHTML(enderecoLinha) : ""}</p>
          <p><strong>${escHTML(currencyBR(mini.preco))}</strong></p>
          <a
            href="${href}"
            class="btn-ver"
            data-id="${mini.id}"
            data-json="${jsonAttr(mini)}">
            Ver Detalhes
          </a>
        </div>
      `;
      lista.appendChild(card);
    });

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

// Salvar dados no clique
document.addEventListener('click', (e) => {
  const link = e.target.closest('.btn-ver');
  if (!link) return;
  try {
    const id  = link.getAttribute('data-id');
    const raw = link.getAttribute('data-json');
    if (!raw) return;
    const obj = JSON.parse(raw);
    sessionStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
    const map = JSON.parse(sessionStorage.getItem('vm:vehiclesById') || '{}');
    if (id) map[id] = obj;
    sessionStorage.setItem('vm:vehiclesById', JSON.stringify(map));
    localStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
  } catch (err) {
    console.warn('[encontrar] erro ao preparar detalhe', err);
  }
});

// encontrar.js — salva o veículo clicado para fallback de detalhe
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-ver'); // mantenha a classe do seu botão/link
  if (!btn) return;

  try {
    // Espera-se que o botão tenha data-id e (opcionalmente) data-json com o objeto
    const id = btn.getAttribute('data-id') || new URL(btn.href).searchParams.get('id');

    // Se você tiver o objeto do veículo no momento da renderização,
    // inclua-o no data-json (stringify). Ex: <a class="btn-ver" data-id="123" data-json='{"id":123,"marca":"..."}' href="veiculo-detalhe.html?id=123">
    const raw = btn.getAttribute('data-json');
    if (raw) {
      const obj = JSON.parse(raw);
      sessionStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
      // Opcional: mantém um map id->obj para abrir em outra aba
      const map = JSON.parse(sessionStorage.getItem('vm:vehiclesById') || '{}');
      if (id) { map[id] = obj; sessionStorage.setItem('vm:vehiclesById', JSON.stringify(map)); }
      // redundância em localStorage
      localStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
    } else if (id) {
      // Sem data-json, ainda assim guardamos um "mínimo" para a rota por id
      sessionStorage.setItem('vm:lastVehicle', JSON.stringify({ id }));
    }
  } catch (err) {
    console.warn('[encontrar] não foi possível salvar fallback do veículo', err);
  }
});
