// /frontend/scripts/encontrar.js
const API_URL = "http://26.122.130.40:8080/veiculos";
let mapa;
let marcadores = [];

/* ==== Base64 seguro para Unicode (UTF-8) ==== */
function b64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}

/* ==== Helpers gerais ==== */
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
// normaliza string (case/acentos) para comparação
function norm(s){
  return String(s||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'') // tira acentos
    .toLowerCase().trim();
}

// mapeia slug -> rótulo exato usado no backend
function categoriaLabelFromSlug(slug){
  const s = norm(slug);
  if (s === 'antigo') return 'Antigo';
  if (s === 'antigo-novo' || s === 'antigonovo') return 'Antigo Novo';
  if (s === 'antigo-velho' || s === 'antigovelho') return 'Antigo Velho';
  return null;
}

function buildMini(v) {
  const imagens = Array.isArray(v.imagens) ? v.imagens.map(i => i?.urlImagem).filter(Boolean) : [];

  const proprietario = v.proprietario || v.vendedor || v.anunciante || v.usuario || v.user || {};
  const nomeProprietario = proprietario.nomeProprietario || proprietario.nome || v.nomeProprietario || v.nome || "";

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
      nome: nomeProprietario || pickOwnerName(proprietario, v),
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
// Base64 seguro + pronto para URL (?data=)
function toB64(obj) {
  const s = JSON.stringify(obj);
  const b64 = b64EncodeUtf8(s);
  return encodeURIComponent(b64);
}
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

/* ===== Carregar veículos =====
   filtroTexto: termo livre (modelo/categoria/cidade)
   categoriaExata: rótulo exato ('Antigo', 'Antigo Novo', 'Antigo Velho') para filtrar da home
*/
async function carregarVeiculos(filtroTexto = "", categoriaExata = null) {
  const lista = document.getElementById("lista-veiculos");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error("Falha ao buscar veículos");
    const veiculos = await resp.json();

    const termo = norm(filtroTexto);
    const catNorm = categoriaExata ? norm(categoriaExata) : null;

    const filtrados = veiculos.filter((v) => {
      const modelo = norm(v.modelo?.nomeModelo);
      const categoria = norm(v.categoria?.nome_categoria);
      const cidade = norm(v.proprietario?.cidade);

      const passTexto = !termo || modelo.includes(termo) || categoria.includes(termo) || cidade.includes(termo);
      const passCategoria = !catNorm || categoria === catNorm;

      return passTexto && passCategoria;
    });

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

  // Lê ?categoria= da URL e aplica filtro exato
  const params = new URLSearchParams(location.search);
  const slug = params.get('categoria'); // exemplo: antigo-novo
  const catLabel = slug ? categoriaLabelFromSlug(slug) : null;

  if (catLabel) {
    // mostra a escolha no campo de busca para o usuário entender o filtro aplicado
    const input = document.getElementById("busca");
    if (input) input.value = catLabel;
    carregarVeiculos(catLabel, catLabel);
  } else {
    carregarVeiculos();
  }

  // Clique em "Buscar" limpa o filtro fixo de categoria e usa só o texto
  document.getElementById("btn-filtrar").addEventListener("click", () => {
    const valor = document.getElementById("busca").value.trim();
    carregarVeiculos(valor, null);
  });
});

// Salvar dados no clique (fallback para detalhe)
document.addEventListener('click', (e) => {
  const link = e.target.closest('.btn-ver');
  if (!link) return;
  try {
    const id  = link.getAttribute('data-id') || new URL(link.href).searchParams.get('id');
    const raw = link.getAttribute('data-json');
    if (raw) {
      const obj = JSON.parse(raw);
      sessionStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
      const map = JSON.parse(sessionStorage.getItem('vm:vehiclesById') || '{}');
      if (id) map[id] = obj;
      sessionStorage.setItem('vm:vehiclesById', JSON.stringify(map));
      localStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
    } else if (id) {
      sessionStorage.setItem('vm:lastVehicle', JSON.stringify({ id }));
    }
  } catch (err) {
    console.warn('[encontrar] erro ao preparar detalhe', err);
  }
});
