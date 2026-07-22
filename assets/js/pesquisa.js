let produtosPesquisa = [];

document.addEventListener("DOMContentLoaded", iniciarPesquisaInteligente);

async function iniciarPesquisaInteligente() {
    const camposPesquisa = document.querySelectorAll(".header-search");

    if (!camposPesquisa.length) {
        return;
    }

    try {
        produtosPesquisa = await buscarProdutos();

        if (!Array.isArray(produtosPesquisa)) {
            produtosPesquisa = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar produtos para pesquisa:", erro);
        produtosPesquisa = [];
    }

    camposPesquisa.forEach((container) => {
        prepararCampoPesquisa(container);
    });
}

function prepararCampoPesquisa(container) {
    const input = container.querySelector("input");
    const botao = container.querySelector("button");

    if (!input) {
        return;
    }

    container.classList.add("pesquisa-container");

    const resultados = document.createElement("div");
    resultados.className = "resultados-pesquisa";
    resultados.hidden = true;

    container.appendChild(resultados);

    input.addEventListener("input", () => {
        pesquisarEnquantoDigita(input, resultados);
    });

    input.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            abrirPesquisaNoCatalogo(input.value);
        }

        if (evento.key === "Escape") {
            fecharResultados(resultados);
        }
    });

    if (botao) {
        botao.type = "button";

        botao.addEventListener("click", () => {
            abrirPesquisaNoCatalogo(input.value);
        });
    }

    document.addEventListener("click", (evento) => {
        if (!container.contains(evento.target)) {
            fecharResultados(resultados);
        }
    });
}

function pesquisarEnquantoDigita(input, resultados) {
    const termo = normalizarTexto(input.value.trim());

    if (termo.length < 2) {
        fecharResultados(resultados);
        return;
    }

    const encontrados = produtosPesquisa
        .filter((produto) => produtoEstaAtivo(produto))
        .filter((produto) => {
            const conteudo = normalizarTexto(`
                ${produto.nome || ""}
                ${produto.categoria || ""}
                ${produto.descricao || ""}
            `);

            return conteudo.includes(termo);
        })
        .slice(0, 6);

    mostrarResultados(encontrados, input.value, resultados);
}

function mostrarResultados(produtos, termoOriginal, resultados) {
    resultados.innerHTML = "";

    if (!produtos.length) {
        resultados.innerHTML = `
            <div class="pesquisa-sem-resultados">
                <i class="fa-solid fa-magnifying-glass"></i>

                <div>
                    <strong>Nenhum produto encontrado</strong>
                    <span>Tente pesquisar outro nome ou categoria.</span>
                </div>
            </div>
        `;

        resultados.hidden = false;
        return;
    }

    produtos.forEach((produto) => {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "resultado-pesquisa-item";

        const precoLoja = formatarPrecoPesquisa(produto.preco_loja);
        const precoEntrega = formatarPrecoPesquisa(produto.preco_entrega);

        const imagemProduto = produto.imagem
            ? `
                <img
                    src="${produto.imagem}"
                    alt="${produto.nome || "Produto"}"
                    loading="lazy"
                >
            `
            : `
                <div class="resultado-pesquisa-sem-imagem">
                    <i class="fa-solid fa-bottle-water"></i>
                </div>
            `;

        item.innerHTML = `
            <div class="resultado-pesquisa-imagem">
                ${imagemProduto}
            </div>

            <div class="resultado-pesquisa-info">
                <strong>${produto.nome || "Produto"}</strong>

                <span>
                    ${produto.categoria || "Bebidas"}
                </span>

                <div class="resultado-pesquisa-precos">
                    ${
                        precoLoja
                            ? `<small>Loja: ${precoLoja}</small>`
                            : ""
                    }

                    ${
                        precoEntrega
                            ? `<small>Entrega: ${precoEntrega}</small>`
                            : ""
                    }
                </div>
            </div>

            <i class="fa-solid fa-chevron-right"></i>
        `;

        item.addEventListener("click", () => {
            abrirPesquisaNoCatalogo(produto.nome);
        });

        resultados.appendChild(item);
    });

    const verTodos = document.createElement("button");

    verTodos.type = "button";
    verTodos.className = "pesquisa-ver-todos";

    verTodos.innerHTML = `
        Ver todos os resultados para
        <strong>“${termoOriginal}”</strong>

        <i class="fa-solid fa-arrow-right"></i>
    `;

    verTodos.addEventListener("click", () => {
        abrirPesquisaNoCatalogo(termoOriginal);
    });

    resultados.appendChild(verTodos);
    resultados.hidden = false;
}

function abrirPesquisaNoCatalogo(termo) {
    const pesquisa = termo.trim();

    if (!pesquisa) {
        return;
    }

    const caminhoCatalogo = estaDentroDaPastaPages()
        ? "catalogo.html"
        : "pages/catalogo.html";

    window.location.href =
        `${caminhoCatalogo}?busca=${encodeURIComponent(pesquisa)}`;
}

function estaDentroDaPastaPages() {
    return window.location.pathname.includes("/pages/");
}

function produtoEstaAtivo(produto) {
    const ativo = normalizarTexto(produto.ativo || "sim");

    return ativo !== "nao" && ativo !== "não";
}

function fecharResultados(resultados) {
    resultados.hidden = true;
    resultados.innerHTML = "";
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatarPrecoPesquisa(valor) {
    const numero = converterPrecoPesquisa(valor);

    if (numero === null) {
        return "";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function converterPrecoPesquisa(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
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

    return Number.isNaN(numero) ? null : numero;
}