// =======================================================
// RC DISTRIBUIDORA
// SERVICE DE PRODUTOS
// FONTE ÚNICA DE DADOS DO SISTEMA
// =======================================================

let cacheProdutos = null;

// =======================================================
// CARREGAR PRODUTOS
// =======================================================

async function carregarProdutos(force = false) {
    if (cacheProdutos && !force) {
        return cacheProdutos;
    }

    try {
        const dados = await buscarAba("Produtos");

        if (!Array.isArray(dados)) {
            cacheProdutos = [];
            return cacheProdutos;
        }

        cacheProdutos = dados
            .map((produto, indice) =>
                normalizarProduto(produto, indice)
            )
            .filter((produto) => produto.ativo === "sim");

        return cacheProdutos;

    } catch (erro) {
        console.error(
            "Erro ao carregar produtos:",
            erro
        );

        cacheProdutos = [];
        return cacheProdutos;
    }
}

// =======================================================
// NORMALIZAR PRODUTO
// =======================================================

function normalizarProduto(produto, indice = 0) {
    const idOriginal =
        produto?.id ??
        produto?.codigo ??
        produto?.produto_id ??
        "";

    const id =
        String(idOriginal).trim() ||
        `produto-${indice + 1}`;

    return {
        id,

        categoria:
            limparTextoProduto(produto?.categoria),

        marca:
            limparTextoProduto(produto?.marca),

        produto:
            limparTextoProduto(
                produto?.produto ||
                produto?.nome
            ),

        nome:
            limparTextoProduto(
                produto?.produto ||
                produto?.nome
            ),

        descricao:
            limparTextoProduto(produto?.descricao),

        volume:
            limparTextoProduto(produto?.volume),

        preco_loja:
            converterPrecoProduto(produto?.preco_loja),

        preco_entrega:
            converterPrecoProduto(produto?.preco_entrega),

        preco:
            converterPrecoProduto(
                produto?.preco ??
                produto?.preco_loja ??
                produto?.preco_entrega
            ),

        imagem:
            limparTextoProduto(
                produto?.imagem ||
                produto?.foto ||
                produto?.image
            ),

        destaque:
            normalizarSimNaoProduto(
                produto?.destaque,
                "nao"
            ),

        mais_vendido:
            normalizarSimNaoProduto(
                produto?.mais_vendido,
                "nao"
            ),

        ativo:
            normalizarSimNaoProduto(
                produto?.ativo,
                "sim"
            ),

        ordem_home:
            converterNumeroInteiroProduto(
                produto?.ordem_home,
                9999
            )
    };
}

// =======================================================
// DESTAQUES
// =======================================================

async function buscarDestaques(limite = 8) {
    const produtos = await carregarProdutos();

    return produtos
        .filter((produto) =>
            produto.destaque === "sim"
        )
        .sort(ordenarProdutosPorHome)
        .slice(0, normalizarLimiteProduto(limite));
}

// =======================================================
// MAIS VENDIDOS
// =======================================================

async function buscarMaisVendidos(limite = 8) {
    const produtos = await carregarProdutos();

    return produtos
        .filter((produto) =>
            produto.mais_vendido === "sim"
        )
        .sort(ordenarProdutosPorHome)
        .slice(0, normalizarLimiteProduto(limite));
}

// =======================================================
// CATEGORIA
// =======================================================

async function buscarCategoria(nome) {
    const produtos = await carregarProdutos();

    const categoriaBuscada =
        normalizarTextoPesquisaProduto(nome);

    if (!categoriaBuscada) {
        return produtos;
    }

    return produtos.filter((produto) =>
        normalizarTextoPesquisaProduto(
            produto.categoria
        ) === categoriaBuscada
    );
}

// =======================================================
// PRODUTO POR ID
// =======================================================

async function buscarProduto(id) {
    const produtos = await carregarProdutos();

    return produtos.find((produto) =>
        String(produto.id) === String(id)
    ) || null;
}

// =======================================================
// PESQUISA
// =======================================================

async function pesquisarProdutos(texto) {
    const produtos = await carregarProdutos();

    const termo =
        normalizarTextoPesquisaProduto(texto);

    if (!termo) {
        return produtos;
    }

    return produtos.filter((produto) => {
        const campos = [
            produto.produto,
            produto.nome,
            produto.marca,
            produto.categoria,
            produto.descricao,
            produto.volume
        ];

        return campos.some((campo) =>
            normalizarTextoPesquisaProduto(campo)
                .includes(termo)
        );
    });
}

// =======================================================
// LIMPAR CACHE
// =======================================================

function limparCacheProdutos() {
    cacheProdutos = null;
}

// =======================================================
// ORDENAÇÃO
// =======================================================

function ordenarProdutosPorHome(a, b) {
    const ordemA =
        Number(a?.ordem_home ?? 9999);

    const ordemB =
        Number(b?.ordem_home ?? 9999);

    if (ordemA !== ordemB) {
        return ordemA - ordemB;
    }

    const nomeA = [
        a?.marca,
        a?.produto
    ]
        .filter(Boolean)
        .join(" ");

    const nomeB = [
        b?.marca,
        b?.produto
    ]
        .filter(Boolean)
        .join(" ");

    return nomeA.localeCompare(
        nomeB,
        "pt-BR"
    );
}

// =======================================================
// CONVERSÃO DE PREÇO
// =======================================================

function converterPrecoProduto(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    let texto = String(valor || "")
        .trim()
        .replace(/\s/g, "")
        .replace(/^R\$/i, "");

    if (!texto) {
        return 0;
    }

    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
    }

    const numero = Number(texto);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

// Mantém compatibilidade com os arquivos antigos.
function converterPreco(valor) {
    return converterPrecoProduto(valor);
}

// =======================================================
// NORMALIZAÇÃO DE SIM E NÃO
// =======================================================

function normalizarSimNaoProduto(
    valor,
    padrao = "nao"
) {
    const texto =
        normalizarTextoPesquisaProduto(valor);

    if (
        texto === "sim" ||
        texto === "s" ||
        texto === "yes" ||
        texto === "true" ||
        texto === "1"
    ) {
        return "sim";
    }

    if (
        texto === "nao" ||
        texto === "n" ||
        texto === "no" ||
        texto === "false" ||
        texto === "0"
    ) {
        return "nao";
    }

    return padrao;
}

// =======================================================
// AUXILIARES
// =======================================================

function limparTextoProduto(valor) {
    return String(valor || "").trim();
}

function normalizarTextoPesquisaProduto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function converterNumeroInteiroProduto(
    valor,
    padrao = 0
) {
    const numero = Number(
        String(valor || "")
            .trim()
            .replace(",", ".")
    );

    return Number.isFinite(numero)
        ? Math.trunc(numero)
        : padrao;
}

function normalizarLimiteProduto(limite) {
    const numero = Number(limite);

    if (!Number.isFinite(numero) || numero <= 0) {
        return 8;
    }

    return Math.trunc(numero);
}