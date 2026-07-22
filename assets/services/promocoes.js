// =======================================================
// RC DISTRIBUIDORA
// SERVICE DE PROMOÇÕES
// =======================================================

async function buscarPromocoes(limitePersonalizado = null) {
    try {
        const produtos = await carregarProdutos();
        const config = await carregarConfiguracoes();

        if (!Array.isArray(produtos)) {
            return [];
        }

        const limiteConfigurado =
            limitePersonalizado ??
            config?.limite_destaques ??
            config?.limite_promocoes ??
            4;

        const limite =
            normalizarLimitePromocoes(
                limiteConfigurado
            );

        const promocoes = produtos
            .filter((produto) =>
                produto &&
                produto.ativo === "sim" &&
                produto.destaque === "sim"
            )
            .sort(ordenarPromocoes);

        if (limite === null) {
            return promocoes;
        }

        return promocoes.slice(0, limite);

    } catch (erro) {
        console.error(
            "Erro ao buscar promoções:",
            erro
        );

        return [];
    }
}

// =======================================================
// ORDENAÇÃO
// =======================================================

function ordenarPromocoes(a, b) {
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
        obterNomePromocaoService(a);

    const nomeB =
        obterNomePromocaoService(b);

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

function normalizarLimitePromocoes(valor) {
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

    const numero =
        Number(valor);

    if (
        !Number.isFinite(numero) ||
        numero <= 0
    ) {
        return 4;
    }

    return Math.trunc(numero);
}

// =======================================================
// AUXILIAR
// =======================================================

function obterNomePromocaoService(produto) {
    return [
        produto?.marca,
        produto?.produto || produto?.nome,
        produto?.volume
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
}