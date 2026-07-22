// ======================================================
// RC DISTRIBUIDORA
// COMPONENTE: CARD DE PRODUTO
// ======================================================

function criarCardProduto(produto, opcoes = {}) {
    const {
        mostrarCategoria = true,
        mostrarPrecoLoja = true,
        mostrarPrecoEntrega = true,
        mostrarBotao = true,
        mostrarFavorito = true
    } = opcoes;

    if (!produto) {
        return "";
    }

    const id = obterIdCardProduto(produto);

    const marca = escaparHTMLCard(
        produto.marca || ""
    );

    const nome = escaparHTMLCard(
        produto.produto ||
        produto.nome ||
        "Produto"
    );

    const volume = escaparHTMLCard(
        produto.volume || ""
    );

    const categoria = escaparHTMLCard(
        produto.categoria || ""
    );

    const descricaoProduto = [
        marca,
        nome,
        volume
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const imagem = obterImagemCardProduto(produto);

    const destaque =
        normalizarTextoCard(produto.destaque) === "sim";

    const precoLoja =
        obterPrecoCardProduto(
            produto.preco_loja ??
            produto.preco
        );

    const precoEntrega =
        obterPrecoCardProduto(
            produto.preco_entrega ??
            produto.preco
        );

    return `
        <article
            class="produto-card"
            data-id="${escaparAtributoCard(id)}"
        >

            ${
                destaque
                    ? `
                        <span class="produto-badge">
                            <i class="fa-solid fa-fire"></i>
                            Destaque
                        </span>
                    `
                    : ""
            }

            ${
                mostrarFavorito
                    ? `
                        <button
                            type="button"
                            class="produto-favorito"
                            data-id="${escaparAtributoCard(id)}"
                            aria-label="Favoritar ${descricaoProduto}"
                            title="Favoritar produto"
                        >
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    `
                    : ""
            }

            <div class="produto-img">

                ${
                    imagem
                        ? `
                            <img
                                loading="lazy"
                                src="${escaparAtributoCard(imagem)}"
                                alt="${descricaoProduto}"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            >

                            <div
                                class="produto-img-fallback"
                                style="display: none;"
                                aria-hidden="true"
                            >
                                <i class="fa-solid fa-box-open"></i>
                            </div>
                        `
                        : `
                            <div
                                class="produto-img-fallback"
                                aria-hidden="true"
                            >
                                <i class="fa-solid fa-box-open"></i>
                            </div>
                        `
                }

            </div>

            <div class="produto-info">

                ${
                    mostrarCategoria && categoria
                        ? `
                            <span class="produto-categoria">
                                ${categoria}
                            </span>
                        `
                        : ""
                }

                ${
                    marca
                        ? `<h3>${marca}</h3>`
                        : ""
                }

                <p class="produto-nome">
                    ${nome}
                    ${volume ? `<span>${volume}</span>` : ""}
                </p>

                <div class="produto-precos">

                    ${
                        mostrarPrecoLoja
                            ? `
                                <div class="price-box">
                                    <small>Loja</small>

                                    <strong>
                                        ${formatarPrecoCard(precoLoja)}
                                    </strong>
                                </div>
                            `
                            : ""
                    }

                    ${
                        mostrarPrecoEntrega
                            ? `
                                <div class="price-box">
                                    <small>Entrega</small>

                                    <strong class="price-delivery">
                                        ${formatarPrecoCard(precoEntrega)}
                                    </strong>
                                </div>
                            `
                            : ""
                    }

                </div>

                ${
                    mostrarBotao
                        ? `
                            <button
                                type="button"
                                class="btn-add-produto"
                                data-id="${escaparAtributoCard(id)}"
                                aria-label="Adicionar ${descricaoProduto} ao pedido"
                            >
                                <i class="fa-solid fa-cart-shopping"></i>
                                Adicionar ao pedido
                            </button>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}

// ======================================================
// IDENTIFICAÇÃO
// ======================================================

function obterIdCardProduto(produto) {
    return (
        produto.id ??
        produto.codigo ??
        produto.produto_id ??
        ""
    );
}

// ======================================================
// IMAGEM
// ======================================================

function obterImagemCardProduto(produto) {
    const imagem =
        produto.imagem ||
        produto.foto ||
        produto.image ||
        "";

    const valor =
        String(imagem).trim();

    return valor || null;
}

// ======================================================
// PREÇO
// ======================================================

function obterPrecoCardProduto(valor) {
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

function formatarPrecoCard(valor) {
    const numero =
        obterPrecoCardProduto(valor);

    if (typeof formatarPreco === "function") {
        return formatarPreco(numero);
    }

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

// ======================================================
// TEXTO
// ======================================================

function normalizarTextoCard(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function escaparHTMLCard(valor) {
    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributoCard(valor) {
    return escaparHTMLCard(valor);
}