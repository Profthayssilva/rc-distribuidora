// ===============================================
// RC DISTRIBUIDORA
// CATÁLOGO
// ===============================================

let produtos = [];
let categoriaAtual = "todos";

const grid = document.getElementById("produtosGrid");
const totalProdutos = document.getElementById("totalProdutos");

const campoBusca = document.getElementById("campoBuscaTopo");
const ordenar = document.getElementById("ordenarProdutos");

// Pesquisa recebida pelo cabeçalho:
// catalogo.html?busca=whisky
const parametrosCatalogo = new URLSearchParams(window.location.search);
const buscaRecebida = parametrosCatalogo.get("busca") || "";

// ===============================================
// Inicialização
// ===============================================

document.addEventListener("DOMContentLoaded", iniciarCatalogo);

async function iniciarCatalogo() {
    try {
        await renderizarCategoriasSidebar();

        produtos = await carregarProdutos();

        if (!Array.isArray(produtos)) {
            produtos = [];
        }

        // Preenche o campo com a pesquisa feita no cabeçalho
        if (campoBusca && buscaRecebida) {
            campoBusca.value = buscaRecebida;
        }

        configurarEventos();

        // Aplica automaticamente busca, categoria e ordenação
        filtrarProdutos();
    } catch (erro) {
        console.error("Erro ao iniciar catálogo:", erro);

        if (grid) {
            grid.innerHTML = `
                <div class="sem-produtos">
                    Não foi possível carregar os produtos.
                </div>
            `;
        }

        if (totalProdutos) {
            totalProdutos.textContent = "0 produto(s) encontrado(s)";
        }
    }
}

// ===============================================
// Eventos
// ===============================================

function configurarEventos() {
    // Busca do catálogo
    if (campoBusca) {
        campoBusca.addEventListener(
            "input",
            debounce(filtrarProdutos, 250)
        );
    }

    // Ordenação
    if (ordenar) {
        ordenar.addEventListener(
            "change",
            filtrarProdutos
        );
    }

    // Categorias
    document.addEventListener("click", (evento) => {
        const botao = evento.target.closest(".filtro-btn");

        if (!botao) {
            return;
        }

        document
            .querySelectorAll(".filtro-btn")
            .forEach((btn) => btn.classList.remove("ativo"));

        botao.classList.add("ativo");

        categoriaAtual =
            botao.dataset.categoria || "todos";

        filtrarProdutos();
    });

    // Carrinho
    if (grid) {
        grid.addEventListener("click", (evento) => {
            const botao =
                evento.target.closest(".btn-add-produto");

            if (!botao) {
                return;
            }

            const produtoId = Number(botao.dataset.id);

            if (Number.isNaN(produtoId)) {
                console.error("ID de produto inválido.");
                return;
            }

            adicionarAoCarrinho(produtoId);
        });
    }
}

// ===============================================
// Renderização
// ===============================================

function renderizarProdutos(lista) {
    if (!Array.isArray(lista)) {
        lista = [];
    }

    if (totalProdutos) {
        totalProdutos.textContent =
            `${lista.length} produto(s) encontrado(s)`;
    }

    if (!grid) {
        return;
    }

    if (!lista.length) {
        grid.innerHTML = `
            <div class="sem-produtos">
                <i class="fa-solid fa-magnifying-glass"></i>

                <strong>Nenhum produto encontrado</strong>

                <span>
                    Tente pesquisar outro produto ou selecionar outra categoria.
                </span>
            </div>
        `;

        return;
    }

    grid.innerHTML = lista
        .map((produto) => criarCardProduto(produto))
        .join("");
}

// ===============================================
// Busca e filtros
// ===============================================

function filtrarProdutos() {
    const textoPesquisa = normalizarTexto(
        campoBusca ? campoBusca.value : buscaRecebida
    );

    let lista = produtos.filter((produto) => {
        if (!produtoEstaAtivo(produto)) {
            return false;
        }

        const nomeProduto = obterNomeProduto(produto);
        const marcaProduto = String(produto.marca || "");
        const categoriaProduto = String(produto.categoria || "");
        const descricaoProduto = String(produto.descricao || "");

        const conteudoPesquisa = normalizarTexto(`
            ${nomeProduto}
            ${marcaProduto}
            ${categoriaProduto}
            ${descricaoProduto}
        `);

        const correspondeBusca =
            !textoPesquisa ||
            conteudoPesquisa.includes(textoPesquisa);

        const correspondeCategoria =
            categoriaAtual === "todos" ||
            normalizarTexto(categoriaProduto) ===
                normalizarTexto(categoriaAtual);

        return correspondeBusca && correspondeCategoria;
    });

    lista = ordenarListaProdutos(lista);

    renderizarProdutos(lista);
}

// ===============================================
// Ordenação
// ===============================================

function ordenarListaProdutos(lista) {
    const listaOrdenada = [...lista];

    const tipoOrdenacao = ordenar
        ? ordenar.value
        : "";

    switch (tipoOrdenacao) {
        case "menor":
            listaOrdenada.sort((a, b) => {
                return (
                    obterPrecoEntrega(a) -
                    obterPrecoEntrega(b)
                );
            });

            break;

        case "maior":
            listaOrdenada.sort((a, b) => {
                return (
                    obterPrecoEntrega(b) -
                    obterPrecoEntrega(a)
                );
            });

            break;

        case "az":
            listaOrdenada.sort((a, b) => {
                const nomeA = `
                    ${a.marca || ""}
                    ${obterNomeProduto(a)}
                `.trim();

                const nomeB = `
                    ${b.marca || ""}
                    ${obterNomeProduto(b)}
                `.trim();

                return nomeA.localeCompare(
                    nomeB,
                    "pt-BR",
                    {
                        sensitivity: "base"
                    }
                );
            });

            break;

        case "za":
            listaOrdenada.sort((a, b) => {
                const nomeA = `
                    ${a.marca || ""}
                    ${obterNomeProduto(a)}
                `.trim();

                const nomeB = `
                    ${b.marca || ""}
                    ${obterNomeProduto(b)}
                `.trim();

                return nomeB.localeCompare(
                    nomeA,
                    "pt-BR",
                    {
                        sensitivity: "base"
                    }
                );
            });

            break;

        default:
            listaOrdenada.sort((a, b) => {
                return (
                    converterNumero(a.ordem) -
                    converterNumero(b.ordem)
                );
            });
    }

    return listaOrdenada;
}

// ===============================================
// Funções auxiliares
// ===============================================

function obterNomeProduto(produto) {
    return String(
        produto.produto ||
        produto.nome ||
        ""
    );
}

function obterPrecoEntrega(produto) {
    const precoEntrega =
        converterNumero(produto.preco_entrega);

    if (precoEntrega > 0) {
        return precoEntrega;
    }

    return converterNumero(produto.preco_loja);
}

function converterNumero(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }

    if (typeof valor === "number") {
        return valor;
    }

    const texto = String(valor)
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const numero = Number(texto);

    return Number.isNaN(numero)
        ? 0
        : numero;
}

function produtoEstaAtivo(produto) {
    const ativo = normalizarTexto(
        produto.ativo || "sim"
    );

    return ativo !== "nao";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}