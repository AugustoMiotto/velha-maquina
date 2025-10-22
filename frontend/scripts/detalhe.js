// /velha-maquina/frontend/scripts/detalhe.js

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("detalhe-container");

    try {
        // 1. Ler o ID da URL
        const params = new URLSearchParams(window.location.search);
        const veiculoId = params.get('id');

        if (!veiculoId) {
            throw new Error('ID do veículo não encontrado na URL.');
        }

        // 2. Chamar o NOVO endpoint da API
        const API_URL = `http://localhost:8080/veiculos/${veiculoId}`;
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            if (resposta.status === 404) throw new Error('Veículo não encontrado.');
            throw new Error('Erro ao buscar dados da API.');
        }

        const v = await resposta.json();

        // 3. Renderizar o HTML Básico (sem a galeria)
        container.innerHTML = `
            <div class="detalhe-header">
                <h2>${v.modelo?.nomeModelo || 'Modelo desconhecido'}</h2>
                <p class="detalhe-preco">R$ ${v.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'Sob consulta'}</p>
            </div>

            <div class="detalhe-galeria">
                <div class="imagem-principal">
                    <img id="img-principal-ativa" 
                         src="${v.imagens && v.imagens.length > 0 ? v.imagens[0].urlImagem : 'https://via.placeholder.com/800x600?text=Sem+Foto'}" 
                         alt="Imagem principal do ${v.modelo?.nomeModelo}">
                </div>
                <div class="galeria-miniaturas" id="galeria-miniaturas-container">
                    </div>
            </div>

            <div class="detalhe-info">
                <h3>Descrição</h3>
                <p>${v.descricao || 'Sem descrição disponível.'}</p>
                
                <h3>Ficha Técnica</h3>
                <ul>
                    <li><strong>Categoria:</strong> ${v.categoria?.nome_categoria || 'N/A'}</li>
                    <li><strong>Ano de Fabricação:</strong> ${v.anoFabricacao}</li>
                    <li><strong>Ano do Modelo:</strong> ${v.anoModelo || 'N/A'}</li>
                    <li><strong>Cor:</strong> ${v.cor || 'N/A'}</li>
                    <li><strong>Quilometragem:</strong> ${v.quilometragem?.toLocaleString('pt-BR') || '0'} km</li>
                    <li><strong>Placa:</strong> ${v.placa || 'N/A'}</li>
                </ul>

                <h3>Vendedor</h3>
                <ul>
                    <li><strong>Proprietário:</strong> ${v.proprietario?.nomeProprietario || 'N/A'}</li>
                    <li><strong>Email:</strong> ${v.proprietario?.email || 'N/A'}</li>
                    <li><strong>Telefone:</strong> ${v.proprietario?.telefone || 'N/A'}</li>
                    <li><strong>Localização:</strong> ${v.proprietario?.cidade || 'N/A'} - ${v.proprietario?.estado || 'N/A'}</li>
                </ul>
            </div>
        `;

        // 4. Lógica da Galeria Interativa
        const galeriaContainer = document.getElementById('galeria-miniaturas-container');
        const imgPrincipal = document.getElementById('img-principal-ativa');

        if (v.imagens && v.imagens.length > 0) {
            v.imagens.forEach((img, index) => {
                // Cria a miniatura
                const miniatura = document.createElement('img');
                miniatura.src = img.urlImagem;
                miniatura.alt = `Miniatura ${index + 1} do ${v.modelo?.nomeModelo}`;
                miniatura.className = 'miniatura';
                
                // Adiciona a classe 'ativa' na primeira miniatura
                if (index === 0) {
                    miniatura.classList.add('ativa');
                }

                // ADICIONA O EVENTO DE CLICK
                miniatura.addEventListener('click', () => {
                    // Atualiza a imagem principal
                    imgPrincipal.src = img.urlImagem;
                    
                    // Remove a classe 'ativa' de todas as outras
                    galeriaContainer.querySelectorAll('.miniatura').forEach(m => m.classList.remove('ativa'));
                    
                    // Adiciona a classe 'ativa' na miniatura clicada
                    miniatura.classList.add('ativa');
                });
                
                // Adiciona a miniatura ao container
                galeriaContainer.appendChild(miniatura);
            });
        }

    } catch (erro) {
        console.error(erro);
        container.innerHTML = `<p class="erro">Erro ao carregar detalhes: ${erro.message}</p>`;
    }
});