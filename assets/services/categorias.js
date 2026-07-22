// =======================================================
// RC DISTRIBUIDORA
// SERVICE DE CATEGORIAS
// =======================================================

let cacheCategorias = null;

// =======================================================
// CARREGAR CATEGORIAS
// =======================================================

async function carregarCategorias(force = false) {
    if (cacheCategorias && !force) {
        return cacheCategorias;
    }

    try {
        const [dadosCategorias, produtos] = await Promise.all([
            buscarAba("Categorias"),
            carregarProdutos()
        ]);

        if (!Array.isArray(dadosCategorias)) {
            cacheCategorias = [];
            return cacheCategorias;
        }

        const categoriasComProdutos =
            obterCategoriasComProdutos(produtos);

        const categoriasNormalizadas = dadosCategorias
            .map((categoria, indice) =>
                normalizarCategoria(categoria, indice)
            )
            .filter((categoria) =>
                categoria.ativo === "sim"
            )
            .filter((categoria) =>
                categoria.nome !== ""
            )
            .filter((categoria) =>
                categoriasComProdutos.has(
                    normalizarTextoCategoria(
                        categoria.nome
                    )
                )
            );

        cacheCategorias =
            removerCategoriasDuplicadas(
                categoriasNormalizadas
            )
            .sort(ordenarCategorias);

        return cacheCategorias;

    } catch (erro) {
        console.error(
            "Erro ao carregar categorias:",
            erro
        );

        cacheCategorias = [];
        return cacheCategorias;
    }
}

// =======================================================
// NORMALIZAR CATEGORIA
// =======================================================

function normalizarCategoria(categoria, indice = 0) {
    const nome =
        limparTextoCategoria(
            categoria?.categoria ||
            categoria?.nome ||
            categoria?.titulo
        );

    return {
        id:
            String(
                categoria?.id ??
                categoria?.codigo ??
                `categoria-${indice + 1}`
            ).trim(),

        nome,

        categoria: nome,

        icone:
            limparTextoCategoria(
                categoria?.icone ||
                categoria?.icon
            ),

        imagem:
            limparTextoCategoria(
                categoria?.imagem ||
                categoria?.foto
            ),

        ordem:
            converterOrdemCategoria(
                categoria?.ordem,
                9999
            ),

        ativo:
            normalizarSimNaoCategoria(
                categoria?.ativo,
                "sim"
            ),

        destaque:
            normalizarSimNaoCategoria(
                categoria?.destaque,
                "nao"
            )
    };
}

// =======================================================
// CATEGORIAS COM PRODUTOS
// =======================================================

function obterCategoriasComProdutos(produtos) {
    const categorias = new Set();

    if (!Array.isArray(produtos)) {
        return categorias;
    }

    produtos.forEach((produto) => {
        const categoria =
            normalizarTextoCategoria(
                produto?.categoria
            );

        if (categoria) {
            categorias.add(categoria);
        }
    });

    return categorias;
}

// =======================================================
// REMOVER DUPLICADAS
// =======================================================

function removerCategoriasDuplicadas(lista) {
    const mapa = new Map();

    lista.forEach((categoria) => {
        const chave =
            normalizarTextoCategoria(
                categoria.nome
            );

        if (!chave) {
            return;
        }

        if (!mapa.has(chave)) {
            mapa.set(chave, categoria);
            return;
        }

        const existente = mapa.get(chave);

        if (categoria.ordem < existente.ordem) {
            mapa.set(chave, categoria);
        }
    });

    return Array.from(mapa.values());
}

// =======================================================
// ORDENAÇÃO
// =======================================================

function ordenarCategorias(a, b) {
    const ordemA =
        Number(a?.ordem ?? 9999);

    const ordemB =
        Number(b?.ordem ?? 9999);

    if (ordemA !== ordemB) {
        return ordemA - ordemB;
    }

    return String(a?.nome || "")
        .localeCompare(
            String(b?.nome || ""),
            "pt-BR",
            {
                sensitivity: "base"
            }
        );
}

// =======================================================
// HOME
// =======================================================

async function buscarCategoriasHome(limite = null) {
    const categorias =
        await carregarCategorias();

    if (limite === null) {
        return categorias;
    }

    const numero =
        Number(limite);

    if (
        !Number.isFinite(numero) ||
        numero <= 0
    ) {
        return categorias;
    }

    return categorias.slice(
        0,
        Math.trunc(numero)
    );
}

// =======================================================
// SIDEBAR
// =======================================================

async function renderizarCategoriasSidebar() {
    const container =
        document.getElementById(
            "listaCategorias"
        );

    if (!container) {
        return;
    }

    try {
        const categorias =
            await carregarCategorias();

        if (!categorias.length) {
            container.innerHTML = `
                <p class="sem-categorias">
                    Nenhuma categoria disponível.
                </p>
            `;

            return;
        }

        if (
            typeof criarCategoriaSidebar !==
            "function"
        ) {
            console.error(
                "A função criarCategoriaSidebar não está disponível."
            );

            container.innerHTML = `
                <p class="sem-categorias">
                    Não foi possível carregar as categorias.
                </p>
            `;

            return;
        }

        container.innerHTML =
            categorias
                .map((categoria) =>
                    criarCategoriaSidebar(
                        categoria
                    )
                )
                .join("");

    } catch (erro) {
        console.error(
            "Erro ao renderizar categorias:",
            erro
        );

        container.innerHTML = `
            <p class="sem-categorias">
                Não foi possível carregar as categorias.
            </p>
        `;
    }
}

// =======================================================
// BUSCAR CATEGORIA PELO NOME
// =======================================================

async function buscarCategoriaPorNome(nome) {
    const categorias =
        await carregarCategorias();

    const termo =
        normalizarTextoCategoria(nome);

    return categorias.find((categoria) =>
        normalizarTextoCategoria(
            categoria.nome
        ) === termo
    ) || null;
}

// =======================================================
// LIMPAR CACHE
// =======================================================

function limparCacheCategorias() {
    cacheCategorias = null;
}

// =======================================================
// AUXILIARES
// =======================================================

function limparTextoCategoria(valor) {
    return String(valor || "").trim();
}

function normalizarTextoCategoria(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function converterOrdemCategoria(
    valor,
    padrao = 9999
) {
    const numero =
        Number(
            String(valor || "")
                .trim()
                .replace(",", ".")
        );

    return Number.isFinite(numero)
        ? numero
        : padrao;
}

function normalizarSimNaoCategoria(
    valor,
    padrao = "nao"
) {
    const texto =
        normalizarTextoCategoria(valor);

    if (
        texto === "sim" ||
        texto === "s" ||
        texto === "true" ||
        texto === "1"
    ) {
        return "sim";
    }

    if (
        texto === "nao" ||
        texto === "n" ||
        texto === "false" ||
        texto === "0"
    ) {
        return "nao";
    }

    return padrao;
}