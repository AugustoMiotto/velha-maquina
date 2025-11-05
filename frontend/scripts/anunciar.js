const API_BASE_URL = "http://26.122.130.40:8080";
let mapa, marcador;

/* Inicializar o mapa */
function inicializarMapa() {
  mapa = L.map('mapa').setView([-15.78, -47.93], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);
}

/* Atualiza o mapa e coleta cidade/estado */
async function atualizarMapaPorEndereco() {
  const endereco = document.getElementById('endereco').value.trim();
  if (!endereco) return;

  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(endereco + ", Brasil")}`,
      {
        headers: {
          "Accept-Language": "pt-BR",
          "User-Agent": "VelhaMaquina/1.0 (contato@velhamaquina.com.br)"
        }
      }
    );
    const dados = await resp.json();

    if (dados.length > 0) {
      const { lat, lon, address } = dados[0];

      // Identifica cidade e estado de forma automática
      const cidade =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "";
      const estado = address.state || "";

      // Preenche os campos ocultos (para enviar ao backend)
      document.getElementById("cidade").value = cidade;
      document.getElementById("estado").value = estado;

      // Atualiza o marcador no mapa
      if (marcador) mapa.removeLayer(marcador);
      marcador = L.marker([lat, lon])
        .addTo(mapa)
        .bindPopup(`${cidade} - ${estado}`)
        .openPopup();
      mapa.setView([lat, lon], 14);
    }
  } catch (erro) {
    console.warn("Erro ao buscar coordenadas:", erro);
  }
}

/* Carrega categorias */
async function carregarCategorias() {
  const select = document.getElementById('categoria');
  try {
    const resposta = await fetch(`${API_BASE_URL}/categorias`);
    const categorias = await resposta.json();
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id_categoria;
      option.textContent = cat.nome_categoria;
      select.appendChild(option);
    });
  } catch (erro) {
    select.innerHTML = `<option value="">Erro ao carregar</option>`;
  }
}

/* Enviar formulário */
async function handleAnuncioSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const statusDiv = document.getElementById('status-envio');
  const btnEnviar = document.getElementById('btn-enviar');

  btnEnviar.disabled = true;
  statusDiv.textContent = 'Enviando...';
  statusDiv.style.color = 'blue';

  try {
    const veiculoJson = {
      anoFabricacao: document.getElementById('ano-fabricacao').value,
      anoModelo: document.getElementById('ano-modelo').value,
      preco: document.getElementById('preco').value,
      quilometragem: document.getElementById('quilometragem').value,
      cor: document.getElementById('cor').value,
      placa: document.getElementById('placa').value,
      descricao: document.getElementById('descricao').value,
      categoria: { id_categoria: document.getElementById('categoria').value },
      modelo: {
        nomeModelo: document.getElementById('modelo-nome').value,
        marca: { nomeMarca: document.getElementById('marca-nome').value }
      },
      proprietario: {
        nomeProprietario: document.getElementById('prop-nome').value,
        email: document.getElementById('prop-email').value,
        telefone: document.getElementById('prop-telefone').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value || null,
        estado: document.getElementById('estado').value || null,
        latitude: marcador?.getLatLng()?.lat || null,
        longitude: marcador?.getLatLng()?.lng || null
      }
    };

    const formData = new FormData();
    formData.append('veiculoJson', JSON.stringify(veiculoJson));

    const imagens = document.getElementById('imagens').files;
    for (let i = 0; i < imagens.length; i++) formData.append('imagens', imagens[i]);

    const resposta = await fetch(`${API_BASE_URL}/veiculos/anunciar`, {
      method: 'POST',
      body: formData
    });

    if (!resposta.ok) throw new Error(`Erro no servidor: ${resposta.status}`);

    const veiculoSalvo = await resposta.json();
    statusDiv.textContent = `Anúncio salvo com sucesso! (ID: ${veiculoSalvo.id_veiculo})`;
    statusDiv.style.color = 'green';
    form.reset();
    if (marcador) mapa.removeLayer(marcador);
  } catch (erro) {
    statusDiv.textContent = `Erro ao enviar: ${erro.message}`;
    statusDiv.style.color = 'red';
  } finally {
    btnEnviar.disabled = false;
  }
}

// === Pré-visualização de imagens selecionadas no input#imagens ===
document.addEventListener('DOMContentLoaded', setupPreviewImagens);

function setupPreviewImagens() {
  const input = document.getElementById('imagens');
  if (!input) return;

  // Cria o container de preview (se não existir)
  let grid = document.getElementById('preview-imagens');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'preview-imagens';
    grid.className = 'preview-grid';
    input.insertAdjacentElement('afterend', grid);
  }

  input.addEventListener('change', () => {
    grid.innerHTML = ''; // limpa previews anteriores
    const files = Array.from(input.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <img src="${url}" alt="${file.name}">
        <span class="preview-name" title="${file.name}">${file.name}</span>
      `;
      grid.appendChild(item);
      // Libera o blob quando não for mais necessário
      item.querySelector('img').addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    });
  });
}

/* Inicialização */
document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
  carregarCategorias();

  document.getElementById('form-anuncio').addEventListener('submit', handleAnuncioSubmit);
  document.getElementById('endereco').addEventListener('blur', atualizarMapaPorEndereco);
});
