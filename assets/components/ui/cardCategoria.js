// =======================================================
// RC DISTRIBUIDORA
// COMPONENTE DE CATEGORIA
// =======================================================

function criarCardCategoria(categoria) {
    if (!categoria) {
        return "";
    }

    const nome =
        escaparHTMLCategoria(
            categoria.nome ||
            categoria.categoria ||
            "Categoria"
        );

    const nomeParametro =
        encodeURIComponent(
            categoria.nome ||
            categoria.categoria ||
            ""
        );

    const icone =
        validarIconeCategoria(
            categoria.icone
        );

    const imagem =
        obterImagemCategoria(categoria);

    return `
        <a
            href="pages/catalogo.html?categoria=${nomeParametro}"
            class="home-category-card"
            data-categoria="${escaparAtributoCategoria(nome)}"
            aria-label="Ver produtos da categoria ${nome}"
        >

            <div class="home-category-icon">

                ${
                    imagem
                        ? `
                            <img
                                src="${escaparAtributoCategoria(imagem)}"
                                alt=""
                                loading="lazy"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';"
                            >

                            <i
                                class="${icone}"
                                style="display: none;"
                                aria-hidden="true"
                            ></i>
                        `
                        : `
                            <i
                                class="${icone}"
                                aria-hidden="true"
                            ></i>
                        `
                }

            </div>

            <strong>
                ${nome}
            </strong>

        </a>
    `;
}

// =======================================================
// CARD PARA SIDEBAR DO CATÁLOGO
// =======================================================

function criarCategoriaSidebar(categoria) {
    if (!categoria) {
        return "";
    }

    const nomeOriginal =
        categoria.nome ||
        categoria.categoria ||
        "";

    const nome =
        escaparHTMLCategoria(
            nomeOriginal || "Categoria"
        );

    const icone =
        validarIconeCategoria(
            categoria.icone
        );

    return `
        <button
            type="button"
            class="filtro-btn"
            data-categoria="${escaparAtributoCategoria(nomeOriginal)}"
            aria-label="Filtrar por ${nome}"
            aria-pressed="false"
        >
            <i
                class="${icone}"
                aria-hidden="true"
            ></i>

            <span>
                ${nome}
            </span>
        </button>
    `;
}

// =======================================================
// CARD "TODAS AS CATEGORIAS"
// =======================================================

function criarCategoriaTodasSidebar() {
    return `
        <button
            type="button"
            class="filtro-btn active"
            data-categoria="todas"
            aria-label="Mostrar todas as categorias"
            aria-pressed="true"
        >
            <i
                class="fa-solid fa-border-all"
                aria-hidden="true"
            ></i>

            <span>
                Todas
            </span>
        </button>
    `;
}

// =======================================================
// ÍCONE
// =======================================================

function validarIconeCategoria(icone) {
    const valor =
        String(icone || "").trim();

    if (!valor) {
        return "fa-solid fa-box-open";
    }

    const classes =
        valor.split(/\s+/);

    const possuiPrefixoFontAwesome =
        classes.some((classe) =>
            [
                "fa-solid",
                "fa-regular",
                "fa-brands",
                "fas",
                "far",
                "fab"
            ].includes(classe)
        );

    const possuiIcone =
        classes.some((classe) =>
            classe.startsWith("fa-") &&
            ![
                "fa-solid",
                "fa-regular",
                "fa-brands"
            ].includes(classe)
        );

    if (
        possuiPrefixoFontAwesome &&
        possuiIcone
    ) {
        return escaparAtributoCategoria(valor);
    }

    if (valor.startsWith("fa-")) {
        return escaparAtributoCategoria(
            `fa-solid ${valor}`
        );
    }

    return "fa-solid fa-box-open";
}

// =======================================================
// IMAGEM
// =======================================================

function obterImagemCategoria(categoria) {
    const imagem =
        categoria?.imagem ||
        categoria?.foto ||
        "";

    const valor =
        String(imagem).trim();

    return valor || null;
}

// =======================================================
// AUXILIARES
// =======================================================

function escaparHTMLCategoria(valor) {
    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributoCategoria(valor) {
    return escaparHTMLCategoria(valor);
}