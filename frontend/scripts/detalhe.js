// /frontend/scripts/detalhe.js
// Corrigido: decodifica ?data= em UTF-8 (sem quebrar acentos).
// Mantém o nome EXATO digitado no anúncio (proprietario.nomeProprietario).

(() => {
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ==== Base64 seguro para Unicode (UTF-8) ==== */
  function b64DecodeUtf8(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
  }

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const url = new URL(location.href);
    const idFromURL = url.searchParams.get('id') || null;

    if (!idFromURL) {
        renderError('ID do veículo não encontrado na URL.');
        return;
    }

    // --- CORREÇÃO (LÓGICA SIMPLIFICADA) ---
    // 1. CHAMA A API DIRETAMENTE. Ignora cache (tryStorage) e URL (tryURLData).
    let apiRaw = await tryAPIOnce(idFromURL);

    if (!apiRaw) {
        renderError('Não foi possível carregar os detalhes do veículo. Verifique a API.');
        return;
    }

    // 2. Normaliza os dados frescos da API
    let d = normalize(apiRaw);

    if (!d) {
        renderError('Não foi possível interpretar os dados do veículo.');
        return;
    }

    // 3. Renderiza (agora 'd' está 100% correto)
    renderAnuncio(d);
    initGallery();
    enableLightbox();
    initWhatsAndEmail();
}

  /* ---------- fontes ---------- */
  function tryURLData(url){
    try{
      const raw = url.searchParams.get('data');
      if (!raw) return null;
      const jsonUtf8 = b64DecodeUtf8(decodeURIComponent(raw));
      return JSON.parse(jsonUtf8);
    }catch(e){
      console.warn('Falha ao decodificar base64 UTF-8:', e);
      return null;
    }
  }
  function tryStorage(id){
    try{
      const pick = k => JSON.parse(sessionStorage.getItem(k) || localStorage.getItem(k) || 'null');
      const map  = pick('vm:vehiclesById');
      if (id && map && map[id]) return map[id];
      return pick('vm:lastVehicle');
    }catch{ return null; }
  }
  async function tryAPIOnce(id){
    const u = `http://26.122.130.40:8080/veiculos/${id}`;
    try{
      const r = await fetch(u, { headers: { 'Accept':'application/json' }});
      if (!r.ok) return null;
      return await r.json();
    }catch{ return null; }
  }

  function renderError(msg){
    const root = $('#detalhe-container');
    if (root) root.innerHTML = `<p>${escapeHTML(msg)}</p>`;
  }

  /* ---------- merge ---------- */
  function mergeVehiclePrefAPI(base, api){
    if (!api) return base;
    const out = { ...base };

    if (api.vendedor?.nome) out.vendedor = { ...out.vendedor, ...api.vendedor };
    else if (!out.vendedor) out.vendedor = api.vendedor;

    if ((!out.imagens || !out.imagens.length) && api.imagens?.length) out.imagens = api.imagens.slice();
    if ((!out.descricao || out.descricao.trim()==='') && api.descricao) out.descricao = api.descricao;

    const keys = ['categoria','modelo','marca','anoFabricacao','anoModelo','preco','quilometragem','cor','placa','opcionais'];
    for (const k of keys){
      if (out[k]==null || out[k]==='' || (Array.isArray(out[k]) && !out[k].length)) {
        out[k] = api[k] ?? out[k];
      }
    }

    out.id = out.id ?? api.id ?? api.id_veiculo ?? null;
    return out;
  }

  /* ---------- normalização ---------- */
  function normalize(n) {
    n = n?.data || n;
    if (!n || typeof n !== 'object') return null;

    let imagens = n.imagens || n.fotos || n.images || n.photos || [];
    if (Array.isArray(imagens)) {
      imagens = imagens.map(i => (typeof i === 'string' ? i : i?.urlImagem)).filter(Boolean);
    } else {
      imagens = [];
    }

    const categoria = n.categoria?.nome_categoria || n.categoria || "";
    const modelo    = n.modelo?.nomeModelo || n.modelo || "";
    const marca     = n.modelo?.marca?.nomeMarca || n.marca || "";

    const anoFab = n.anoFabricacao ?? n.ano_fabricacao ?? n.ano ?? "";
    const anoMod = n.anoModelo ?? n.ano_modelo ?? "";

    const preco = n.preco ?? n.valor ?? null;
    const quilometragem = n.quilometragem ?? n.km ?? "";
    const cor   = n.cor || "";
    const placa = n.placa || n.placaVeiculo || "";

    const descricao =
      n.descricao || n.descricaoVeiculo || n.descricao_anuncio ||
      n.descricaoAnuncio || n.observacoes || n.obs || "";

    let vendedor = { nome:"", email:"", telefone:"", cidade:"", estado:"" };
    if (n.proprietario) {
      vendedor = {
        nome: (n.proprietario.nomeProprietario || "").trim(),
        email: n.proprietario.email || "",
        telefone: n.proprietario.telefone || "",
        cidade: n.proprietario.cidade || "",
        estado: n.proprietario.estado || ""
      };
    } else if (n.vendedor) {
      vendedor = {
        nome: (n.vendedor.nome || "").trim(),
        email: n.vendedor.email || "",
        telefone: n.vendedor.telefone || "",
        cidade: n.vendedor.cidade || "",
        estado: n.vendedor.estado || ""
      };
    }

    let opcionais = n.opcionais || n.itens || n.acessorios || [];
    if (typeof opcionais === "string")
      opcionais = opcionais.split(",").map(s => s.trim()).filter(Boolean);
    if (!Array.isArray(opcionais)) opcionais = [];

    return {
      id: n.id_veiculo ?? n.id ?? n._id ?? null,
      categoria, modelo, marca,
      anoFabricacao: anoFab,
      anoModelo: anoMod,
      preco, quilometragem, cor, placa,
      descricao,
      vendedor,
      imagens, opcionais
    };
  }

  /* ---------- render ---------- */
  function renderAnuncio(d) {
    const root = $('#detalhe-container');
    if (!root) return;

    const imagens = d.imagens?.length ? d.imagens : ['/velha-maquina/frontend/assets/imagem1.png'];
    const main = imagens[0];
    const endereco = [d.vendedor?.cidade, d.vendedor?.estado].filter(Boolean).join(' / ');

    root.innerHTML = `
      <header class="detalhe-header">
        <h1 class="detalhe-titulo">${escapeHTML(`${d.marca || ''} ${d.modelo || ''}`.trim() || 'Veículo')}</h1>
        <strong class="detalhe-preco">${escapeHTML(currencyBR(d.preco))}</strong>
      </header>

      <section class="detalhe-grid">
        <div class="galeria" data-auto="true" data-count="${imagens.length}">
          <img class="main-img" src="${escapeAttr(main)}" alt="Foto principal do veículo">
          <div class="thumbs">
            ${imagens.map((src, i) =>
              `<img src="${escapeAttr(src)}" data-src="${escapeAttr(src)}" class="${i===0 ? 'ativa':''}" alt="Miniatura ${i+1}">`
            ).join('')}
          </div>
        </div>

        <aside class="info">
          <h3>Informações do veículo</h3>
          <table class="tabela t-veiculo">
            <tbody>
              <tr><th>Categoria</th><td>${escapeHTML(d.categoria || '—')}</td></tr>
              <tr><th>Modelo</th><td>${escapeHTML(d.modelo || '—')}</td></tr>
              <tr><th>Marca</th><td>${escapeHTML(d.marca || '—')}</td></tr>
              <tr><th>Ano de Fabricação</th><td>${escapeHTML(d.anoFabricacao || '—')}</td></tr>
              <tr><th>Ano do Modelo</th><td>${escapeHTML(d.anoModelo || '—')}</td></tr>
              <tr><th>Preço (R$)</th><td>${escapeHTML(currencyBR(d.preco))}</td></tr>
              <tr><th>Quilometragem</th><td>${escapeHTML(d.quilometragem !== '' ? String(d.quilometragem).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' km' : '—')}</td></tr>
              <tr><th>Cor</th><td>${escapeHTML(d.cor || '—')}</td></tr>
              <tr><th>Placa</th><td>${escapeHTML(d.placa || '—')}</td></tr>
            </tbody>
          </table>

          <h3>Proprietário</h3>
          <table class="tabela t-vendedor">
            <tbody>
              <tr><th>Nome do Proprietário</th><td>${escapeHTML(d.vendedor?.nome || '—')}</td></tr>
              <tr><th>Email</th><td class="td-email">${escapeHTML(d.vendedor?.email || '—')}</td></tr>
              <tr><th>Telefone</th><td class="td-tel" data-whats="${escapeAttr(d.vendedor?.telefone || '')}">${escapeHTML(d.vendedor?.telefone || '—')}</td></tr>
              <tr><th>Endereço</th><td>${escapeHTML(endereco || '—')}</td></tr>
            </tbody>
          </table>

          ${d.opcionais?.length ? `
            <h3>Itens do anúncio</h3>
            <div class="opcionais">
              ${d.opcionais.map(op => `<span class="op-badge">${escapeHTML(op)}</span>`).join('')}
            </div>
          ` : ''}

          <div class="acoes">
            <a class="btn btn-whats" id="btn-whats" href="#" target="_blank" rel="noopener">💬 Falar no WhatsApp</a>
            <a class="btn btn-email" id="btn-email" href="#">📧 Enviar E-mail</a>
          </div>
        </aside>
      </section>

      <section class="desc">
        <h3>Descrição</h3>
        <p>${nl2br(escapeHTML(d.descricao || '—'))}</p>
      </section>

      </section>
        <a class="btn btn-editar" id="btn-editar" href="editar.html?id=${d.id}" > Editar Anúncio </a>
      </section>
    `;
  }

  /* ---------- WhatsApp + Email ---------- */
  function initWhatsAndEmail() {
    const tdTel = $('.t-vendedor .td-tel');
    const tdEmail = $('.t-vendedor .td-email');
    const btnW = $('#btn-whats');
    const btnE = $('#btn-email');

    if (tdTel && btnW) {
      const raw = (tdTel.getAttribute('data-whats') || tdTel.textContent || '').replace(/\D+/g, '');
      if (raw) {
        const phone = raw.startsWith('55') ? raw : '55' + raw;
        btnW.href = `https://wa.me/${phone}`;
        btnW.classList.add('ativo');
      } else {
        btnW.removeAttribute('href');
        btnW.classList.remove('ativo');
      }
    }

    if (tdEmail && btnE) {
      const email = (tdEmail.textContent || '').trim();
      if (email && email.includes('@')) {
        btnE.href = `mailto:${email}`;
        btnE.classList.add('ativo');
      } else {
        btnE.removeAttribute('href');
        btnE.classList.remove('ativo');
      }
    }
  }

  /* ---------- galeria/lightbox ---------- */
  function initGallery() {
    const main = $('.main-img');
    const thumbs = $$('.thumbs img');
    const galeria = $('.galeria');
    if (!main || !thumbs.length || !galeria) return;

    let idx = Math.max(0, thumbs.findIndex(t => t.classList.contains('ativa')));
    const goTo = (i) => {
      thumbs[idx]?.classList.remove('ativa');
      idx = (i + thumbs.length) % thumbs.length;
      thumbs[idx].classList.add('ativa');
      const src = thumbs[idx].dataset.src || thumbs[idx].src;
      if (src) main.src = src;
      main.dataset.index = String(idx);
    };

    thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    main.dataset.index = String(idx);
  }

  function enableLightbox(){
    const main = $('.main-img');
    const thumbs = $$('.thumbs img');
    if (!main || !thumbs.length) return;

    let overlay = $('#vm-lightbox');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'vm-lightbox';
      overlay.className = 'vm-lightbox';
      overlay.innerHTML = `
        <button class="vm-close" aria-label="Fechar (Esc)">✕</button>
        <button class="vm-nav vm-prev" aria-label="Imagem anterior">‹</button>
        <img class="vm-photo" src="" alt="Visualização da imagem do veículo">
        <button class="vm-nav vm-next" aria-label="Próxima imagem">›</button>
      `;
      document.body.appendChild(overlay);
    }

    const photo = $('.vm-photo', overlay);
    const btnPrev = $('.vm-prev', overlay);
    const btnNext = $('.vm-next', overlay);
    const btnClose = $('.vm-close', overlay);
    const imgs = thumbs.map(t => t.dataset.src || t.src);
    let idx = Number(main.dataset.index || 0);

    function open(i){
      idx = (i + imgs.length) % imgs.length;
      photo.src = imgs[idx];
      overlay.classList.add('open');
      document.documentElement.classList.add('vm-no-scroll');
    }
    function close(){
      overlay.classList.remove('open');
      document.documentElement.classList.remove('vm-no-scroll');
      photo.src = '';
    }
    function next(){ open(idx + 1); }
    function prev(){ open(idx - 1); }

    main.addEventListener('click', () => open(Number(main.dataset.index || 0)));
    btnNext.addEventListener('click', next);
    btnPrev.addEventListener('click', prev);
    btnClose.addEventListener('click', close);
    overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });

    document.addEventListener('keydown', (e)=>{
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  /* ---------- utils ---------- */
  function currencyBR(v) {
    if (v === undefined || v === null || v === '') return '—';
    try {
      const num = typeof v === 'number' ? v : Number(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (Number.isFinite(num)) return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return String(v);
    } catch { return String(v); }
  }
  function escapeHTML(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
  function escapeAttr(s) { return escapeHTML(s).replaceAll('`','&#96;'); }
  function nl2br(s){ return String(s).replace(/\r\n|\n/g, '<br>'); }
})();
