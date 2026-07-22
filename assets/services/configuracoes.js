// ======================================================
// RC DISTRIBUIDORA
// SERVICE DE CONFIGURAÇÕES
// Fonte única das configurações do site
// ======================================================

let cacheConfiguracoes = null;

// ======================================================
// CARREGAR CONFIGURAÇÕES
// ======================================================

async function carregarConfiguracoes(force = false) {
    if (cacheConfiguracoes && !force) {
        return cacheConfiguracoes;
    }

    try {
        const dados = await buscarAba("Configuracoes");

        if (!Array.isArray(dados)) {
            cacheConfiguracoes = {};
            return cacheConfiguracoes;
        }

        cacheConfiguracoes = dados.reduce(
            (configuracoes, item) => {
                const chave = normalizarChaveConfiguracao(
                    item?.chave
                );

                if (!chave) {
                    return configuracoes;
                }

                configuracoes[chave] =
                    normalizarValorConfiguracao(
                        item?.valor
                    );

                return configuracoes;
            },
            {}
        );

        return cacheConfiguracoes;

    } catch (erro) {
        console.error(
            "Erro ao carregar configurações:",
            erro
        );

        cacheConfiguracoes = {};
        return cacheConfiguracoes;
    }
}

// ======================================================
// RECUPERAR CONFIGURAÇÃO
// ======================================================

async function getConfig(chave, valorPadrao = "") {
    const config = await carregarConfiguracoes();

    const chaveNormalizada =
        normalizarChaveConfiguracao(chave);

    if (!chaveNormalizada) {
        return valorPadrao;
    }

    const valor = config[chaveNormalizada];

    return valor !== undefined &&
        valor !== null &&
        valor !== ""
        ? valor
        : valorPadrao;
}

// ======================================================
// RECUPERAR CONFIGURAÇÃO NUMÉRICA
// ======================================================

async function getConfigNumero(
    chave,
    valorPadrao = 0
) {
    const valor = await getConfig(
        chave,
        valorPadrao
    );

    return converterNumeroConfiguracao(
        valor,
        valorPadrao
    );
}

// ======================================================
// RECUPERAR CONFIGURAÇÃO SIM/NÃO
// ======================================================

async function getConfigBooleano(
    chave,
    valorPadrao = false
) {
    const valor = await getConfig(
        chave,
        valorPadrao ? "sim" : "nao"
    );

    return converterBooleanoConfiguracao(
        valor,
        valorPadrao
    );
}

// ======================================================
// RECUPERAR CONFIGURAÇÃO POR LISTA DE CHAVES
// ======================================================

async function getConfigPrimeira(
    chaves,
    valorPadrao = ""
) {
    const config = await carregarConfiguracoes();

    if (!Array.isArray(chaves)) {
        return valorPadrao;
    }

    for (const chave of chaves) {
        const chaveNormalizada =
            normalizarChaveConfiguracao(chave);

        const valor =
            config[chaveNormalizada];

        if (
            valor !== undefined &&
            valor !== null &&
            valor !== ""
        ) {
            return valor;
        }
    }

    return valorPadrao;
}

// ======================================================
// VERIFICAR SE EXISTE CONFIGURAÇÃO
// ======================================================

async function existeConfig(chave) {
    const config = await carregarConfiguracoes();

    const chaveNormalizada =
        normalizarChaveConfiguracao(chave);

    return Object.prototype.hasOwnProperty.call(
        config,
        chaveNormalizada
    );
}

// ======================================================
// LIMPAR CACHE
// ======================================================

function limparCacheConfiguracoes() {
    cacheConfiguracoes = null;
}

// ======================================================
// FORÇAR ATUALIZAÇÃO
// ======================================================

async function atualizarConfiguracoes() {
    limparCacheConfiguracoes();

    return carregarConfiguracoes(true);
}

// ======================================================
// NORMALIZAR CHAVE
// ======================================================

function normalizarChaveConfiguracao(valor) {
    return String(valor || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-+/g, "_");
}

// ======================================================
// NORMALIZAR VALOR
// ======================================================

function normalizarValorConfiguracao(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor).trim();
}

// ======================================================
// CONVERTER NÚMERO
// ======================================================

function converterNumeroConfiguracao(
    valor,
    valorPadrao = 0
) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : valorPadrao;
    }

    let texto = String(valor || "")
        .trim()
        .replace(/\s/g, "")
        .replace(/^R\$/i, "");

    if (!texto) {
        return valorPadrao;
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
        : valorPadrao;
}

// ======================================================
// CONVERTER BOOLEANO
// ======================================================

function converterBooleanoConfiguracao(
    valor,
    valorPadrao = false
) {
    const texto = String(valor || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (
        texto === "sim" ||
        texto === "s" ||
        texto === "true" ||
        texto === "1" ||
        texto === "ativo"
    ) {
        return true;
    }

    if (
        texto === "nao" ||
        texto === "n" ||
        texto === "false" ||
        texto === "0" ||
        texto === "inativo"
    ) {
        return false;
    }

    return valorPadrao;
}