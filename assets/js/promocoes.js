// ======================================================
// RC DISTRIBUIDORA
// PÁGINA: PROMOÇÕES
// ======================================================

let promocoes = [];

document.addEventListener("DOMContentLoaded", iniciarPromocoes);

async function iniciarPromocoes() {
    try {
        const gridPromocoes =
            document.getElementById("promocoesGrid");

        if (!gridPromocoes) {
            return;
        }

        promocoes = await buscarPromocoes();

        if (!Array.isArray(promocoes)) {
            promocoes = [];
        }

        renderizarPromocoes(promocoes);
        configurarEventosPromocoes();

    } catch (erro) {
        console.error(
            "Erro ao carregar promoções:",
            erro
        );

        mostrarErroPromocoes(
            "Não foi possível carregar as promoções."
        );
    }
}

// ======================================================
// EVENTOS
// ======================================================

function configurarEventosPromocoes() {
    const campoBusca =
        document.getElementById("campoBuscaPromocoes");

    const ordenar =
        document.getElementById("ordenarPromocoes");

    const botaoBuscar =
        document.getElementById("btnBuscarPromocoes");

    const grid =
        document.getElementById("promocoesGrid");

    if (campoBusca) {
        campoBusca.addEventListener(
            "input",
            typeof debounce === "function"
                ? debounce(filtrarPromocoes, 250)
                : filtrarPromocoes
        );

        campoBusca.addEventListener(
            "keydown",
            (evento) => {
                if (evento.key === "Enter") {
                    evento.preventDefault();
                    filtrarPromocoes();
                }
            }
        );
    }

    if (ordenar) {
        ordenar.addEventListener(
            "change",
            filtrarPromocoes
        );
    }

    if (botaoBuscar) {
        botaoBuscar.addEventListener(
            "click",
            filtrarPromocoes
        );
    }

    if (grid) {
        grid.addEventListener(
            "click",
            tratarCliquePromocao
        );
    }
}

function tratarCliquePromocao(evento) {
    const botao =
        evento.target.closest(".btn-add-produto");

    if (!botao) {
        return;
    }

    const idProduto =
        botao.dataset.id;

    const produto =
        promocoes.find((item) =>
            String(obterIdPromocao(item)) === String(idProduto)
        );

    if (!produto) {
        console.warn(
            "Produto da promoção não encontrado:",
            idProduto
        );

        return;
    }

    if (typeof adicionarAoCarrinho === "function") {
        adicionarAoCarrinho(produto);
    }
}

// ======================================================
// RENDERIZAÇÃO
// ======================================================

function renderizarPromocoes(lista) {
    const grid =
        document.getElementById("promocoesGrid");

    const total =
        document.getElementById("totalPromocoes");

    if (!grid) {
        return;
    }

    const produtosValidos =
        Array.isArray(lista)
            ? lista.filter(Boolean)
            : [];

    if (total) {
        total.textContent =
            criarTextoTotalPromocoes(
                produtosValidos.length
            );
    }

    if (!produtosValidos.length) {
        grid.innerHTML = `
            <div class="sem-produtos">
                <i class="fa-solid fa-tags"></i>

                <h3>Nenhuma promoção encontrada</h3>

                <p>
                    Tente pesquisar por outro produto,
                    marca ou categoria.
                </p>
            </div>
        `;

        return;
    }

    if (typeof criarCardProduto !== "function") {
        mostrarErroPromocoes(
            "Não foi possível montar os cards das promoções."
        );

        return;
    }

    grid.innerHTML = produtosValidos
        .map((produto) =>
            criarCardProduto(produto)
        )
        .join("");
}

function criarTextoTotalPromocoes(total) {
    if (total === 0) {
        return "Nenhuma promoção disponível";
    }

    if (total === 1) {
        return "1 produto em promoção";
    }

    return `${total} produtos em promoção`;
}

function mostrarErroPromocoes(mensagem) {
    const grid =
        document.getElementById("promocoesGrid");

    const total =
        document.getElementById("totalPromocoes");

    if (total) {
        total.textContent =
            "Erro ao carregar promoções";
    }

    if (grid) {
        grid.innerHTML = `
            <div class="sem-produtos">
                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Não foi possível carregar</h3>

                <p>${mensagem}</p>
            </div>
        `;
    }
}

// ======================================================
// FILTROS E ORDENAÇÃO
// ======================================================

function filtrarPromocoes() {
    const campoBusca =
        document.getElementById("campoBuscaPromocoes");

    const ordenar =
        document.getElementById("ordenarPromocoes");

    const termo =
        normalizarTextoPromocao(
            campoBusca?.value || ""
        );

    let lista = promocoes.filter((produto) => {
        const nome =
            normalizarTextoPromocao(
                obterNomePromocao(produto)
            );

        const marca =
            normalizarTextoPromocao(
                produto?.marca
            );

        const categoria =
            normalizarTextoPromocao(
                produto?.categoria
            );

        const descricao =
            normalizarTextoPromocao(
                produto?.descricao
            );

        return (
            nome.includes(termo) ||
            marca.includes(termo) ||
            categoria.includes(termo) ||
            descricao.includes(termo)
        );
    });

    lista = ordenarListaPromocoes(
        lista,
        ordenar?.value || "padrao"
    );

    renderizarPromocoes(lista);
}

function ordenarListaPromocoes(lista, ordem) {
    const listaOrdenada = [...lista];

    switch (ordem) {
        case "menor":
            listaOrdenada.sort(
                (a, b) =>
                    obterPrecoPromocao(a) -
                    obterPrecoPromocao(b)
            );
            break;

        case "maior":
            listaOrdenada.sort(
                (a, b) =>
                    obterPrecoPromocao(b) -
                    obterPrecoPromocao(a)
            );
            break;

        case "az":
            listaOrdenada.sort(
                (a, b) =>
                    obterNomeCompletoPromocao(a)
                        .localeCompare(
                            obterNomeCompletoPromocao(b),
                            "pt-BR"
                        )
            );
            break;

        case "za":
            listaOrdenada.sort(
                (a, b) =>
                    obterNomeCompletoPromocao(b)
                        .localeCompare(
                            obterNomeCompletoPromocao(a),
                            "pt-BR"
                        )
            );
            break;
    }

    return listaOrdenada;
}

// ======================================================
// AUXILIARES
// ======================================================

function obterIdPromocao(produto) {
    return (
        produto?.id ??
        produto?.codigo ??
        produto?.produto_id ??
        ""
    );
}

function obterNomePromocao(produto) {
    return (
        produto?.produto ||
        produto?.nome ||
        ""
    );
}

function obterNomeCompletoPromocao(produto) {
    return [
        produto?.marca,
        obterNomePromocao(produto)
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
}

function obterPrecoPromocao(produto) {
    const valor =
        produto?.preco_entrega ??
        produto?.preco_loja ??
        produto?.preco ??
        0;

    return converterNumeroPromocao(valor);
}

function converterNumeroPromocao(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    const texto = String(valor || "")
        .trim()
        .replace(/\s/g, "")
        .replace(/^R\$/i, "");

    if (!texto) {
        return 0;
    }

    const normalizado =
        texto.includes(",")
            ? texto
                .replace(/\./g, "")
                .replace(",", ".")
            : texto;

    const numero =
        Number(normalizado);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

function normalizarTextoPromocao(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}