// /velha-maquina/frontend/scripts/anunciar.js

// Use o IP do RadminVPN
const API_BASE_URL = "http://26.122.130.40:8080";

/**
 * Função 1: Carregar as categorias no dropdown
 */
async function carregarCategorias() {
    const select = document.getElementById('categoria');
    try {
        const resposta = await fetch(`${API_BASE_URL}/categorias`);
        if (!resposta.ok) throw new Error('Falha ao buscar categorias');
        
        const categorias = await resposta.json();
        
        select.innerHTML = '<option value="">Selecione uma categoria</option>'; // Limpa o "Carregando..."
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id_categoria; // O valor é o ID
            option.textContent = cat.nome_categoria; // O texto é o Nome
            select.appendChild(option);
        });
        
    } catch (erro) {
        select.innerHTML = `<option value="">Erro ao carregar</option>`;
        console.error(erro);
    }
}

/**
 * Função 2: Lidar com o envio do formulário
 */
async function handleAnuncioSubmit(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const form = event.target;
    const statusDiv = document.getElementById('status-envio');
    const btnEnviar = document.getElementById('btn-enviar');
    
    btnEnviar.disabled = true;
    statusDiv.textContent = 'Enviando, por favor aguarde...';
    statusDiv.style.color = 'blue';

    try {
        // --- ETAPA 1: Criar o objeto veiculoJson  ---
        const veiculoJson = {
            // --- Campos Corrigidos  ---
            anoFabricacao: document.getElementById('ano-fabricacao').value, 
            anoModelo: document.getElementById('ano-modelo').value,       
            
            preco: document.getElementById('preco').value,
            quilometragem: document.getElementById('quilometragem').value,
            cor: document.getElementById('cor').value,
            placa: document.getElementById('placa').value,
            descricao: document.getElementById('descricao').value,
            
            // --- Objeto Categoria Aninhado ---
            // (Assumindo que sua classe Categoria.java tem o campo 'id_categoria')
            categoria: {
                id_categoria: document.getElementById('categoria').value
            },
            
            // --- Objeto Modelo Aninhado ---
            modelo: {
                nomeModelo: document.getElementById('modelo-nome').value, 
                marca: {
                    // Assumindo que Marca.java tem 'nome_marca'
                    nomeMarca: document.getElementById('marca-nome').value
                }
            },
            
            // --- Objeto Proprietario Aninhado  ---
            
            proprietario: {
                nomeProprietario: document.getElementById('prop-nome').value, 
                email: document.getElementById('prop-email').value,
                telefone: document.getElementById('prop-telefone').value
            }
        };

        // --- ETAPA 2: Criar o FormData ---
        const formData = new FormData();
        
        // Adiciona o JSON como uma string no campo "veiculoJson"
        // (O nome deve bater EXATAMENTE com o @RequestParam do Spring)
        formData.append('veiculoJson', JSON.stringify(veiculoJson));
        
        // --- ETAPA 3: Adicionar os arquivos de imagem ---
        const inputImagens = document.getElementById('imagens');
        const arquivos = inputImagens.files;

        if (arquivos.length === 0) {
            throw new Error('Você deve selecionar pelo menos uma imagem.');
        }

        for (let i = 0; i < arquivos.length; i++) {
            // Adiciona cada arquivo no campo "imagens"
            // (O nome deve bater EXATAMENTE com o @RequestParam do Spring)
            formData.append('imagens', arquivos[i]);
        }
        
        // --- ETAPA 4: Enviar o Fetch (POST) ---
        const resposta = await fetch(`${API_BASE_URL}/veiculos/anunciar`, {
            method: 'POST',
            body: formData
            // IMPORTANTE: NÃO defina o 'Content-Type'. 
            // O navegador faz isso automaticamente para multipart/form-data
        });
        
        if (!resposta.ok) {
            throw new Error(`Erro no servidor: ${resposta.status}`);
        }

        // --- ETAPA 5: Sucesso ---
        const veiculoSalvo = await resposta.json();
        statusDiv.textContent = `Anúncio salvo com sucesso! (ID: ${veiculoSalvo.id_veiculo})`;
        statusDiv.style.color = 'green';
        form.reset(); // Limpa o formulário

    } catch (erro) {
        statusDiv.textContent = `Erro ao enviar: ${erro.message}`;
        statusDiv.style.color = 'red';
    } finally {
        btnEnviar.disabled = false; // Reabilita o botão
    }
}


// --- Inicialização ---
// Quando a página carregar, busca as categorias
document.addEventListener('DOMContentLoaded', carregarCategorias);
// Quando o formulário for enviado, chama a função handleSubmit
document.getElementById('form-anuncio').addEventListener('submit', handleAnuncioSubmit);