// =======================================================
// RC DISTRIBUIDORA
// SERVICE MAIS VENDIDOS
// =======================================================

async function buscarMaisVendidosService(limitePersonalizado = null) {
    try {
        const produtos = await carregarProdutos();
        const config = await carregarConfiguracoes();

        if (!Array.isArray(produtos)) {
            return [];
        }

        const limiteConfigurado =
            limitePersonalizado ??
            config?.limite_mais_vendidos ??
            8;

        const limite =
            normalizarLimiteMaisVendidos(
                limiteConfigurado
            );

        const maisVendidos = produtos
            .filter((produto) =>
                produto &&
                produto.ativo === "sim" &&
                produto.mais_vendido === "sim"
            )
            .sort(ordenarMaisVendidos);

        if (limite === null) {
            return maisVendidos;
        }

        return maisVendidos.slice(0, limite);

    } catch (erro) {
        console.error(
            "Erro ao buscar produtos mais vendidos:",
            erro
        );

        return [];
    }
}

// =======================================================
// COMPATIBILIDADE COM O RESTANTE DO SISTEMA
// =======================================================

async function carregarMaisVendidos(limite = null) {
    return buscarMaisVendidosService(limite);
}

// =======================================================
// ORDENAÇÃO
// =======================================================

function ordenarMaisVendidos(a, b) {
    const ordemA =
        Number.isFinite(Number(a?.ordem_home))
            ? Number(a.ordem_home)
            : 9999;

    const ordemB =
        Number.isFinite(Number(b?.ordem_home))
            ? Number(b.ordem_home)
            : 9999;

    if (ordemA !== ordemB) {
        return ordemA - ordemB;
    }

    const nomeA =
        obterNomeMaisVendido(a);

    const nomeB =
        obterNomeMaisVendido(b);

    return nomeA.localeCompare(
        nomeB,
        "pt-BR",
        {
            sensitivity: "base"
        }
    );
}

// =======================================================
// LIMITE
// =======================================================

function normalizarLimiteMaisVendidos(valor) {
    const texto =
        String(valor ?? "")
            .trim()
            .toLowerCase();

    if (
        texto === "todos" ||
        texto === "todas" ||
        texto === "all" ||
        texto === "sem limite"
    ) {
        return null;
    }

    const numero = Number(valor);

    if (
        !Number.isFinite(numero) ||
        numero <= 0
    ) {
        return 8;
    }

    return Math.trunc(numero);
}

// =======================================================
// AUXILIAR
// =======================================================

function obterNomeMaisVendido(produto) {
    return [
        produto?.marca,
        produto?.produto || produto?.nome,
        produto?.volume
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
}