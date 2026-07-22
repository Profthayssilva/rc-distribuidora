// =======================================================
// RC DISTRIBUIDORA
// SERVICE GOOGLE SHEETS
// RESPONSÁVEL POR LER AS ABAS DA PLANILHA
// =======================================================

const GOOGLE_SHEETS_CONFIG = {
    apiKey: "AIzaSyBMGxsAIw0cx-STIPEAjpx_gDJuXfIwfHs",
    sheetId: "1ujcAvJ1Mfxd5Kx6N39hFZOOvQsOgt_wnszpBxcMYOdc"
};

const cacheAbasSheets = new Map();

// =======================================================
// BUSCAR ABA
// =======================================================

async function buscarAba(nomeAba, force = false) {
    const aba = String(nomeAba || "").trim();

    if (!aba) {
        console.error(
            "Nome da aba não informado."
        );

        return [];
    }

    const chaveCache =
        normalizarNomeAbaSheets(aba);

    if (
        cacheAbasSheets.has(chaveCache) &&
        !force
    ) {
        return cacheAbasSheets.get(chaveCache);
    }

    try {
        const intervalo =
            encodeURIComponent(`'${aba}'`);

        const url =
            `https://sheets.googleapis.com/v4/spreadsheets/` +
            `${encodeURIComponent(GOOGLE_SHEETS_CONFIG.sheetId)}` +
            `/values/${intervalo}` +
            `?majorDimension=ROWS` +
            `&key=${encodeURIComponent(GOOGLE_SHEETS_CONFIG.apiKey)}`;

        const resposta = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        });

        if (!resposta.ok) {
            const detalhes =
                await lerErroRespostaSheets(resposta);

            throw new Error(
                `Erro ${resposta.status} ao buscar a aba "${aba}". ` +
                detalhes
            );
        }

        const dados = await resposta.json();

        if (
            !Array.isArray(dados?.values) ||
            dados.values.length === 0
        ) {
            console.warn(
                `A aba "${aba}" está vazia ou não possui dados.`
            );

            cacheAbasSheets.set(chaveCache, []);

            return [];
        }

        const linhas = dados.values;

        const cabecalho =
            normalizarCabecalhoSheets(
                linhas[0]
            );

        if (!cabecalho.length) {
            console.warn(
                `A aba "${aba}" não possui cabeçalho válido.`
            );

            cacheAbasSheets.set(chaveCache, []);

            return [];
        }

        const registros = linhas
            .slice(1)
            .filter(linha =>
                linhaPossuiConteudoSheets(linha)
            )
            .map(linha =>
                transformarLinhaEmObjetoSheets(
                    cabecalho,
                    linha
                )
            );

        cacheAbasSheets.set(
            chaveCache,
            registros
        );

        return registros;

    } catch (erro) {
        console.error(
            `Erro ao buscar a aba "${aba}":`,
            erro
        );

        return [];
    }
}

// =======================================================
// TRANSFORMAR LINHA EM OBJETO
// =======================================================

function transformarLinhaEmObjetoSheets(
    cabecalho,
    linha
) {
    const item = {};

    cabecalho.forEach((coluna, indice) => {
        if (!coluna) {
            return;
        }

        item[coluna] =
            normalizarValorCelulaSheets(
                linha?.[indice]
            );
    });

    return item;
}

// =======================================================
// NORMALIZAR CABEÇALHO
// =======================================================

function normalizarCabecalhoSheets(cabecalho) {
    if (!Array.isArray(cabecalho)) {
        return [];
    }

    const chavesUtilizadas = new Map();

    return cabecalho.map((coluna, indice) => {
        let chave =
            normalizarChaveSheets(coluna);

        if (!chave) {
            chave = `coluna_${indice + 1}`;
        }

        const quantidade =
            chavesUtilizadas.get(chave) || 0;

        chavesUtilizadas.set(
            chave,
            quantidade + 1
        );

        if (quantidade > 0) {
            return `${chave}_${quantidade + 1}`;
        }

        return chave;
    });
}

// =======================================================
// NORMALIZAR CHAVE
// =======================================================

function normalizarChaveSheets(valor) {
    return String(valor || "")
        .replace(/^\uFEFF/, "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s-]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

// =======================================================
// NORMALIZAR VALOR DA CÉLULA
// =======================================================

function normalizarValorCelulaSheets(valor) {
    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor).trim();
}

// =======================================================
// VERIFICAR LINHA VAZIA
// =======================================================

function linhaPossuiConteudoSheets(linha) {
    if (!Array.isArray(linha)) {
        return false;
    }

    return linha.some(celula =>
        String(celula ?? "").trim() !== ""
    );
}

// =======================================================
// LER DETALHES DE ERRO
// =======================================================

async function lerErroRespostaSheets(resposta) {
    try {
        const dados = await resposta.json();

        return (
            dados?.error?.message ||
            dados?.message ||
            "Não foi possível carregar os dados."
        );

    } catch {
        return "Não foi possível carregar os dados.";
    }
}

// =======================================================
// LIMPAR CACHE DE UMA ABA
// =======================================================

function limparCacheAbaSheets(nomeAba) {
    const chave =
        normalizarNomeAbaSheets(nomeAba);

    cacheAbasSheets.delete(chave);
}

// =======================================================
// LIMPAR TODO O CACHE
// =======================================================

function limparCacheSheets() {
    cacheAbasSheets.clear();
}

// =======================================================
// ATUALIZAR UMA ABA
// =======================================================

async function atualizarAba(nomeAba) {
    limparCacheAbaSheets(nomeAba);

    return buscarAba(nomeAba, true);
}

// =======================================================
// NORMALIZAR NOME PARA CACHE
// =======================================================

function normalizarNomeAbaSheets(valor) {
    return String(valor || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}