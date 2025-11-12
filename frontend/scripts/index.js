// index.js — carrossel + destaques com link robusto para detalhes
const API_URL = "http://26.122.130.40:8080/veiculos";

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  carregarDestaques();
});

// ---------- Carousel (já existente, mantive simples) ----------
function initCarousel(){
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsBox = document.getElementById('carousel-dots');
  if (!slides.length || !dotsBox) return;

  slides.forEach((_,i)=>{
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i===0?' active':'');
    d.addEventListener('click', ()=>go(i));
    dotsBox.appendChild(d);
  });
  let idx = 0, timer = null;
  const go = (i)=>{
    slides[idx].classList.remove('active');
    dotsBox.children[idx].classList.remove('active');
    idx = (i+slides.length)%slides.length;
    slides[idx].classList.add('active');
    dotsBox.children[idx].classList.add('active');
  };
  const start = ()=>{ stop(); timer=setInterval(()=>go(idx+1),3500); };
  const stop  = ()=>{ if(timer){clearInterval(timer); timer=null;} };
  start();
  document.querySelector('.hero-carousel').addEventListener('mouseenter', stop);
  document.querySelector('.hero-carousel').addEventListener('mouseleave', start);
}

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

// ---------- Destaques ----------
function toB64(obj){ return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(obj))))); }
function mini(v) {
  const imagens = Array.isArray(v.imagens) ? v.imagens.map(i => i?.urlImagem).filter(Boolean) : [];
  const proprietario = v.proprietario || v.vendedor || v.anunciante || v.usuario || v.user || {};
  const nomeV = pickOwnerName(proprietario, v);

  const descricao =
    v.descricao || v.descricaoVeiculo || v.descricao_veiculo ||
    v.descricao_anuncio || v.descricaoAnuncio || v.descricaoCompleta ||
    v.observacoes || v.observacao || v.obs || v.texto || '';

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
      nome: nomeV,
      email: proprietario.email || v.email || "",
      telefone: proprietario.telefone || proprietario.whatsapp || proprietario.phone || "",
      cidade: proprietario.cidade || "",
      estado: proprietario.estado || ""
    },
    imagens
  };
}



async function carregarDestaques(){
  const box = document.getElementById('destaques-container');
  if (!box) return;
  box.innerHTML = '<p>Carregando destaques...</p>';
  try{
    const r = await fetch(API_URL);
    if (!r.ok) throw new Error('Falha ao buscar destaques');
    const lista = await r.json();

    // pegue os primeiros N como destaque (ajuste se tiver endpoint próprio)
    const top = (Array.isArray(lista) ? lista.slice(0,8) : []);
    if (!top.length){ box.innerHTML = '<p>Nenhum destaque no momento.</p>'; return; }

    box.innerHTML = '';
    top.forEach(v=>{
      const m = mini(v);
      const href = `/velha-maquina/frontend/views/veiculo-detalhe.html?id=${m.id}&data=${toB64(m)}`;
      const card = document.createElement('a');
      card.className = 'destaque-link';
      card.href = href;
      card.setAttribute('data-id', m.id);
      card.setAttribute('data-json', JSON.stringify(m).replace(/"/g,'&quot;'));
      card.innerHTML = `
        <article class="carro-card">
          <div class="imagem-container">
            <img src="${m.imagens?.[0] || '/velha-maquina/frontend/assets/imagem1.png'}" alt="${(m.nomeAnuncio||m.modelo)||''}">
          </div>
          <div class="carro-info">
            <h3>${(m.nomeAnuncio || `${m.marca} ${m.modelo}`).trim()}</h3>
            <p>${m.categoria || ''} • ${m.cidade || v.proprietario?.cidade || ''}</p>
            <p><strong>${(m.preco!=null)? Number(m.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : '—'}</strong></p>
            <span class="btn-card">Ver detalhes</span>
          </div>
        </article>
      `;
      box.appendChild(card);
    });

  }catch(e){
    console.error(e);
    box.innerHTML = '<p>Erro ao carregar destaques.</p>';
  }
}

// garante storage ao clicar nos destaques (igual Encontrar)
document.addEventListener('click', (e)=>{
  const link = e.target.closest('.destaque-link');
  if (!link) return;
  try{
    const id  = link.getAttribute('data-id') || new URL(link.href, location.origin).searchParams.get('id');
    const raw = link.getAttribute('data-json');
    if (!raw) return;
    const obj = JSON.parse(raw);
    sessionStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
    const map = JSON.parse(sessionStorage.getItem('vm:vehiclesById') || '{}');
    if (id) map[id]=obj;
    sessionStorage.setItem('vm:vehiclesById', JSON.stringify(map));
    localStorage.setItem('vm:lastVehicle', JSON.stringify(obj));
  }catch(err){ console.warn('[index] não foi possível preparar dados do detalhe', err); }
});
