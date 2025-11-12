

const API_BASE_URL = "http://26.122.130.40:8080";
let veiculoId = null; // ID do veículo sendo editado
let mapa, marcador; // Variáveis globais do mapa

/**
 Inicializar o mapa 
 */
function inicializarMapa() {
    // Inicializa o mapa, mas não define a visualização ainda
    mapa = L.map('mapa').setView([-15.78, -47.93], 5); // Visão geral do Brasil
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);
}

/**
 * Atualizar mapa por endereço 
 */
async function atualizarMapaPorEndereco() {
    const endereco = document.getElementById('endereco').value.trim();
    if (!endereco) return;

    try {
        const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(endereco + ", Brasil")}`,
            { headers: { "Accept-Language": "pt-BR" } }
        );
        const dados = await resp.json();

        if (dados.length > 0) {
            const { lat, lon, address } = dados[0];
            const cidade = address.city || address.town || address.village || address.municipality || "";
            const estado = address.state || "";

            // Preenche os campos ocultos
            document.getElementById("cidade").value = cidade;
            document.getElementById("estado").value = estado;

            // Atualiza o marcador
            if (marcador) mapa.removeLayer(marcador);
            marcador = L.marker([lat, lon]).addTo(mapa).bindPopup(`${cidade} - ${estado}`).openPopup();
            mapa.setView([lat, lon], 14);
        }
    } catch (erro) {
        console.warn("Erro ao buscar coordenadas:", erro);
    }
}

/**
  Carregar Categorias
 */
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

/**
 Setup do Preview de Imagens 
 */
function setupPreviewImagens() {
    const input = document.getElementById('imagens');
    if (!input) return;

    let grid = document.getElementById('preview-imagens-novas'); 
    if (!grid) {
        grid = document.createElement('div');
        grid.id = 'preview-imagens-novas';
        grid.className = 'preview-grid';
        
        const label = document.querySelector('label[for="imagens"]');
        label.insertAdjacentElement('afterend', grid);
    }

    input.addEventListener('change', () => {
        grid.innerHTML = '';
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
            item.querySelector('img').addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        });
    });
}

/**
 Carregar os dados existentes no formulário 
 */
async function carregarDadosDoVeiculo() {
    const params = new URLSearchParams(window.location.search);
    veiculoId = params.get('id');
    const statusDiv = document.getElementById('status-envio');

    if (!veiculoId) {
        statusDiv.textContent = "Erro: ID do veículo não encontrado na URL.";
        statusDiv.style.color = 'red';
        document.getElementById('btn-enviar').disabled = true;
        return;
    }

    try {
        statusDiv.textContent = "Carregando dados do veículo...";
        const resposta = await fetch(`${API_BASE_URL}/veiculos/${veiculoId}`);
        if (!resposta.ok) throw new Error('Falha ao buscar dados do veículo');
        
        const v = await resposta.json();

        console.log("Dados recebidos da API:", v);
        console.log("Dados do proprietário:", v.proprietario);
        console.log("Latitude:", v.proprietario.latitude);
        console.log("Longitude:", v.proprietario.longitude);

     
        document.getElementById('prop-nome').value = v.proprietario.nomeProprietario;
        document.getElementById('prop-email').value = v.proprietario.email;
        document.getElementById('prop-telefone').value = v.proprietario.telefone;
        
     
        const enderecoSalvo = [v.proprietario.cidade, v.proprietario.estado].filter(Boolean).join(', ');
        document.getElementById('endereco').value = enderecoSalvo;
        document.getElementById('cidade').value = v.proprietario.cidade;
        document.getElementById('estado').value = v.proprietario.estado;

       
        if (v.proprietario.latitude && v.proprietario.longitude) {
            const lat = v.proprietario.latitude;
            const lon = v.proprietario.longitude;
            if (marcador) mapa.removeLayer(marcador);
            marcador = L.marker([lat, lon]).addTo(mapa).bindPopup(`${v.proprietario.cidade} - ${v.proprietario.estado}`).openPopup();
            mapa.setView([lat, lon], 14);
        }

        // --- PREENCHE O RESTO DO FORMULÁRIO ---
        document.getElementById('categoria').value = v.categoria.id_categoria;
        document.getElementById('marca-nome').value = v.modelo.marca.nomeMarca;
        document.getElementById('modelo-nome').value = v.modelo.nomeModelo;
        document.getElementById('ano-fabricacao').value = v.anoFabricacao;
        document.getElementById('ano-modelo').value = v.anoModelo;
        document.getElementById('quilometragem').value = v.quilometragem;
        document.getElementById('cor').value = v.cor;
        document.getElementById('preco').value = v.preco;
        document.getElementById('placa').value = v.placa;
        document.getElementById('descricao').value = v.descricao;

        // --- PREENCHE AS IMAGENS JÁ EXISTENTES ---
        const gridExistentes = document.getElementById('preview-imagens');
        if (gridExistentes && v.imagens && v.imagens.length > 0) {
            
            v.imagens.forEach(img => {
                const item = document.createElement('div');
                item.className = 'preview-item preview-item-existente';
                // Adiciona um ID único ao container para remoção
                item.id = `imagem-existente-${img.id_imagem}`; 
                
                item.innerHTML = `
                    <img src="${img.urlImagem}" alt="Imagem existente">
                    
                    <button type="button" class="btn-remover-img" data-id="${img.id_imagem}">X</button>
                `;
                gridExistentes.appendChild(item);

                // --- A PARTE MÁGICA ---
                // Anexa o "ouvidor" de clique DIRETAMENTE ao botão que acabamos de criar
                item.querySelector('.btn-remover-img').addEventListener('click', handleExcluirImagem);
            });
        }
        
        statusDiv.textContent = `Editando: ${v.modelo.nomeModelo}`;
        statusDiv.style.color = '#333';

    } catch (erro) {
        statusDiv.textContent = `Erro ao carregar dados: ${erro.message}`;
        statusDiv.style.color = 'red';
    }
}

/**
 * EXCLUSÃO de uma imagem existente
 * (Chamada quando o usuário clica no 'X' de uma imagem)
 */
async function handleExcluirImagem(event) {
    const botao = event.currentTarget; 
    const idImagem = botao.dataset.id; 
    
    if (!idImagem) return;

    
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) {
        return;
    }

    botao.disabled = true;
    botao.textContent = '...';

    try {
        const resposta = await fetch(`${API_BASE_URL}/veiculos/imagens/${idImagem}`, {
            method: 'DELETE'
        });

        // 204 No Content é o sucesso
        if (resposta.status === 204) {
            // Sucesso! Remove a imagem da tela.
            // Pega o 'div' pai (preview-item) e o remove.
            botao.closest('.preview-item-existente').remove();
        } else {
            throw new Error(`Erro ao excluir no servidor: ${resposta.status}`);
        }
    } catch (erro) {
        console.error("Erro ao excluir imagem:", erro);
        alert("Não foi possível excluir a imagem. Tente novamente.");
        botao.disabled = false;
        botao.textContent = 'X';
    }
}

/**
 * ENVIO do formulário (o Update)
 */
async function handleUpdateSubmit(event) {
    event.preventDefault(); 
    
    const statusDiv = document.getElementById('status-envio');
    const btnEnviar = document.getElementById('btn-enviar');
    
    btnEnviar.disabled = true;
    statusDiv.textContent = 'Atualizando, por favor aguarde...';
    statusDiv.style.color = 'blue';

    try {
        // --- Criar o objeto veiculoJson ---
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

        // --- Criar o FormData ---
        const formData = new FormData();
        formData.append('veiculoJson', JSON.stringify(veiculoJson));
        
        // --- Adicionar APENAS as NOVAS imagens ---
        const inputImagens = document.getElementById('imagens');
        const arquivos = inputImagens.files;
        
        for (let i = 0; i < arquivos.length; i++) {
            formData.append('imagens', arquivos[i]); 
        }
        
        // --- ETAPA 4: Enviar o Fetch (PUT) ---
        const resposta = await fetch(`${API_BASE_URL}/veiculos/editar/${veiculoId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!resposta.ok) {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

        
        const veiculoAtualizado = await resposta.json();
        statusDiv.textContent = `Anúncio "${veiculoAtualizado.modelo.nomeModelo}" atualizado com sucesso!`;
        statusDiv.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = `veiculo-detalhe.html?id=${veiculoId}`;
        }, 2000);

    } catch (erro) {
        statusDiv.textContent = `Erro ao atualizar: ${erro.message}`;
        statusDiv.style.color = 'red';
    } finally {
        btnEnviar.disabled = false;
    }
}

/**
 EXCLUSÃO do anúncio
 */
async function handleExcluirSubmit() {
    
    if (!veiculoId) {
        alert("Erro: Não foi possível identificar o veículo. Recarregue a página.");
        return;
    }

   
    const confirmacao = confirm(
        "Tem certeza que deseja EXCLUIR este anúncio?\n\nEsta ação não pode ser desfeita."
    );
    
    if (!confirmacao) {
        return; // O usuário clicou em "Cancelar"
    }

    const statusDiv = document.getElementById('status-envio');
    const btnExcluir = document.getElementById('btn-excluir');
    document.getElementById('btn-enviar').disabled = true; // Desabilita o de salvar também
    btnExcluir.disabled = true;
    
    statusDiv.textContent = 'Excluindo, por favor aguarde...';
    statusDiv.style.color = 'red';

    try {
        const resposta = await fetch(`${API_BASE_URL}/veiculos/excluir/${veiculoId}`, {
            method: 'DELETE'
        });

        // 204 No Content é o código de sucesso padrão para um DELETE
        if (resposta.status === 204) {
            statusDiv.textContent = 'Anúncio excluído com sucesso! Redirecionando...';
            statusDiv.style.color = 'green';
            
            // Espera 2 segundos e manda o usuário de volta para a Home
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 2000);
        
        } else if (resposta.status === 404) {
            throw new Error('Anúncio não encontrado no servidor (404).');
        } else {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

    } catch (erro) {
        statusDiv.textContent = `Erro ao excluir: ${erro.message}`;
        statusDiv.style.color = 'red';
        btnExcluir.disabled = false;
        document.getElementById('btn-enviar').disabled = false;
    }
}


// --- Inicialização da Página ---
document.addEventListener('DOMContentLoaded', () => {
    inicializarMapa();        // 1. Cria o mapa
    carregarCategorias();       // 2. Preenche o dropdown de categorias
    setupPreviewImagens();      // 3. Prepara o preview de NOVAS imagens
    carregarDadosDoVeiculo();   // 4. Busca dados e PREENCHE o formulário e o mapa
    
    // 5. Anexa o listener de SUBMIT para a função de ATUALIZAR
    document.getElementById('form-anuncio').addEventListener('submit', handleUpdateSubmit);
    // 6. Anexa o listener de BLUR para o mapa
    document.getElementById('endereco').addEventListener('blur', atualizarMapaPorEndereco);
    document.getElementById('btn-excluir').addEventListener('click', handleExcluirSubmit);
});