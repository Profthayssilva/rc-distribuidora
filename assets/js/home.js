// ======================================================
// RC DISTRIBUIDORA
// HOME
// Controlador da página inicial
// ======================================================

let homeProdutos = [];
let homeCategorias = [];
let homeConfiguracoes = {};
let homeBanners = [];
let intervaloHeroHome = null;

// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarHome
);

async function iniciarHome() {
    try {
        homeConfiguracoes =
            await carregarConfiguracoes();

        await Promise.all([
            carregarHeaderHome(),
            carregarHeroSliderHome()
        ]);

        const [
            categoriasCarregadas,
            produtosCarregados
        ] = await Promise.all([
            buscarCategoriasHome(),
            carregarProdutos()
        ]);

        homeCategorias =
            Array.isArray(categoriasCarregadas)
                ? categoriasCarregadas
                : [];

        homeProdutos =
            Array.isArray(produtosCarregados)
                ? produtosCarregados
                : [];

        renderizarCategoriasHome();

        await Promise.all([
            renderizarDestaquesHome(),
            renderizarMaisVendidosHome()
        ]);

        renderizarFooterHome();
        registrarEventosHome();

    } catch (erro) {
        console.error(
            "Erro ao carregar a página inicial:",
            erro
        );

        exibirErroHome();
    }
}

// ======================================================
// HEADER
// ======================================================

async function carregarHeaderHome() {
    document.title =
        homeConfiguracoes.seo_title ||
        homeConfiguracoes.nome_empresa ||
        "RC Distribuidora";

    const logo =
        document.querySelector(".logo img");

    if (logo) {
        const caminhoLogo =
            obterCaminhoImagemHome(
                homeConfiguracoes.logo,
                "assets/img/"
            );

        if (caminhoLogo) {
            logo.src = caminhoLogo;
        }

        logo.alt =
            homeConfiguracoes.nome_empresa ||
            "RC Distribuidora";
    }

    const linkWhatsApp =
        obterLinkWhatsAppHome();

    document
        .querySelectorAll(
            ".header-whats, .floating-whats"
        )
        .forEach((elemento) => {
            if (!linkWhatsApp) {
                elemento.style.display = "none";
                return;
            }

            elemento.href = linkWhatsApp;
            elemento.target = "_blank";
            elemento.rel = "noopener noreferrer";
        });
}

// ======================================================
// HERO SLIDER
// ======================================================

async function carregarHeroSliderHome() {
    const container =
        document.getElementById("heroSlider");

    if (!container) {
        return;
    }

    try {
        homeBanners =
            typeof carregarBanners === "function"
                ? await carregarBanners()
                : [];

        if (!Array.isArray(homeBanners)) {
            homeBanners = [];
        }

        if (!homeBanners.length) {
            container.innerHTML = "";
            container.style.display = "none";
            return;
        }

        const slides = homeBanners
            .map((banner, indice) => {
                if (
                    typeof criarHeroSlide !==
                    "function"
                ) {
                    return "";
                }

                return criarHeroSlide(
                    banner,
                    indice === 0
                );
            })
            .join("");

        const pontos = homeBanners
            .map((_, indice) => `
                <button
                    type="button"
                    class="hero-dot ${
                        indice === 0
                            ? "active"
                            : ""
                    }"
                    data-slide="${indice}"
                    aria-label="Exibir banner ${indice + 1}"
                    aria-pressed="${
                        indice === 0
                            ? "true"
                            : "false"
                    }"
                ></button>
            `)
            .join("");

        container.innerHTML = `
            ${slides}

            ${
                homeBanners.length > 1
                    ? `
                        <div
                            class="hero-dots"
                            role="tablist"
                            aria-label="Banners da página inicial"
                        >
                            ${pontos}
                        </div>
                    `
                    : ""
            }
        `;

        iniciarSliderHome();

    } catch (erro) {
        console.error(
            "Erro ao carregar banners:",
            erro
        );

        container.innerHTML = "";
        container.style.display = "none";
    }
}

// ======================================================
// CONTROLE DO SLIDER
// ======================================================

function iniciarSliderHome() {
    const slides =
        Array.from(
            document.querySelectorAll(
                "#heroSlider .hero-slide"
            )
        );

    const pontos =
        Array.from(
            document.querySelectorAll(
                "#heroSlider .hero-dots button"
            )
        );

    if (!slides.length) {
        return;
    }

    let slideAtual = 0;

    function mostrarSlideHome(indice) {
        if (
            indice < 0 ||
            indice >= slides.length
        ) {
            return;
        }

        slides.forEach((slide, posicao) => {
            const ativo =
                posicao === indice;

            slide.classList.toggle(
                "active",
                ativo
            );

            slide.setAttribute(
                "aria-hidden",
                ativo ? "false" : "true"
            );
        });

        pontos.forEach((ponto, posicao) => {
            const ativo =
                posicao === indice;

            ponto.classList.toggle(
                "active",
                ativo
            );

            ponto.setAttribute(
                "aria-pressed",
                ativo ? "true" : "false"
            );
        });

        slideAtual = indice;
    }

    pontos.forEach((ponto, indice) => {
        ponto.addEventListener(
            "click",
            () => {
                mostrarSlideHome(indice);
                reiniciarIntervaloHeroHome();
            }
        );
    });

    mostrarSlideHome(0);

    if (slides.length > 1) {
        intervaloHeroHome =
            window.setInterval(() => {
                const proximo =
                    (slideAtual + 1) %
                    slides.length;

                mostrarSlideHome(proximo);
            }, 5000);
    }
}

function reiniciarIntervaloHeroHome() {
    if (intervaloHeroHome) {
        clearInterval(intervaloHeroHome);
        intervaloHeroHome = null;
    }

    iniciarSliderHome();
}

// ======================================================
// CATEGORIAS
// ======================================================

function renderizarCategoriasHome() {
    const container =
        document.getElementById(
            "homeCategorias"
        );

    if (!container) {
        return;
    }

    if (!homeCategorias.length) {
        container.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma categoria disponível.
            </p>
        `;

        return;
    }

    if (
        typeof criarCardCategoria !==
        "function"
    ) {
        container.innerHTML = `
            <p class="mensagem-erro">
                Não foi possível exibir as categorias.
            </p>
        `;

        return;
    }

    const limite =
        obterNumeroHome(
            homeConfiguracoes.limite_categorias_home,
            6
        );

    container.innerHTML =
        homeCategorias
            .slice(0, limite)
            .map(criarCardCategoria)
            .join("");
}

// ======================================================
// DESTAQUES E PROMOÇÕES
// ======================================================

async function renderizarDestaquesHome() {
    const container =
        document.getElementById(
            "homePromocoes"
        );

    if (!container) {
        return;
    }

    try {
        container.setAttribute(
            "aria-busy",
            "true"
        );

        const lista =
            typeof buscarPromocoes === "function"
                ? await buscarPromocoes()
                : [];

        renderizarListaProdutosHome(
            container,
            lista,
            "Nenhuma promoção disponível no momento."
        );

    } catch (erro) {
        console.error(
            "Erro ao renderizar promoções:",
            erro
        );

        exibirErroContainerHome(container);

    } finally {
        container.setAttribute(
            "aria-busy",
            "false"
        );
    }
}

// ======================================================
// MAIS VENDIDOS
// ======================================================

async function renderizarMaisVendidosHome() {
    const container =
        document.getElementById(
            "homeMaisVendidos"
        );

    if (!container) {
        return;
    }

    try {
        container.setAttribute(
            "aria-busy",
            "true"
        );

        let lista = [];

        if (
            typeof buscarMaisVendidosService ===
            "function"
        ) {
            lista =
                await buscarMaisVendidosService();

        } else if (
            typeof buscarMaisVendidos ===
            "function"
        ) {
            lista =
                await buscarMaisVendidos();
        }

        renderizarListaProdutosHome(
            container,
            lista,
            "Nenhum produto mais vendido disponível."
        );

    } catch (erro) {
        console.error(
            "Erro ao renderizar mais vendidos:",
            erro
        );

        exibirErroContainerHome(container);

    } finally {
        container.setAttribute(
            "aria-busy",
            "false"
        );
    }
}

// ======================================================
// RENDERIZAR LISTA DE PRODUTOS
// ======================================================

function renderizarListaProdutosHome(
    container,
    lista,
    mensagemVazia
) {
    if (!Array.isArray(lista) || !lista.length) {
        container.innerHTML = `
            <p class="mensagem-vazia">
                ${escaparHTMLHome(mensagemVazia)}
            </p>
        `;

        return;
    }

    if (
        typeof criarCardProduto !==
        "function"
    ) {
        exibirErroContainerHome(container);
        return;
    }

    container.innerHTML =
        lista
            .map((produto) =>
                criarCardProduto(produto, {
                    caminhoImagem:
                        "assets/img/produtos/",
                    mostrarCategoria: true,
                    mostrarPrecoLoja: true,
                    mostrarPrecoEntrega: true,
                    mostrarBotao: true,
                    mostrarFavorito: true
                })
            )
            .join("");
}

// ======================================================
// FOOTER
// ======================================================

function renderizarFooterHome() {
    const telefone =
        document.getElementById(
            "footerTelefone"
        );

    const endereco =
        document.getElementById(
            "footerEndereco"
        );

    const instagram =
        document.getElementById(
            "footerInstagram"
        );

    const telefoneValor =
        homeConfiguracoes.telefone ||
        homeConfiguracoes.whatsapp ||
        "";

    const enderecoCompleto = [
        homeConfiguracoes.endereco,
        homeConfiguracoes.bairro,
        homeConfiguracoes.cidade
    ]
        .filter(Boolean)
        .join(" - ");

    if (telefone) {
        telefone.innerHTML = `
            <i
                class="fa-solid fa-phone"
                aria-hidden="true"
            ></i>

            <span>
                ${escaparHTMLHome(
                    telefoneValor
                )}
            </span>
        `;
    }

    if (endereco) {
        endereco.innerHTML = `
            <i
                class="fa-solid fa-location-dot"
                aria-hidden="true"
            ></i>

            <span>
                ${escaparHTMLHome(
                    enderecoCompleto
                )}
            </span>
        `;
    }

    if (instagram) {
        const instagramValor =
            homeConfiguracoes.instagram ||
            "";

        const linkInstagram =
            obterLinkInstagramHome(
                instagramValor
            );

        instagram.innerHTML = `
            <i
                class="fa-brands fa-instagram"
                aria-hidden="true"
            ></i>

            ${
                linkInstagram
                    ? `
                        <a
                            href="${escaparAtributoHome(linkInstagram)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${escaparHTMLHome(
                                instagramValor
                            )}
                        </a>
                    `
                    : `
                        <span>
                            ${escaparHTMLHome(
                                instagramValor
                            )}
                        </span>
                    `
            }
        `;
    }
}

// ======================================================
// EVENTOS
// ======================================================

function registrarEventosHome() {
    document.addEventListener(
        "click",
        async (evento) => {
            const botao =
                evento.target.closest(
                    ".btn-add-produto"
                );

            if (!botao) {
                return;
            }

            evento.preventDefault();

            const id =
                botao.dataset.id ||
                botao.dataset.produtoId;

            if (!id) {
                return;
            }

            if (
                typeof adicionarAoCarrinho !==
                "function"
            ) {
                window.location.href =
                    "pages/catalogo.html";

                return;
            }

            const produto =
                homeProdutos.find(
                    (item) =>
                        String(item.id) ===
                        String(id)
                );

            try {
                await adicionarAoCarrinho(
                    produto || id
                );
            } catch (erro) {
                console.error(
                    "Erro ao adicionar produto ao carrinho:",
                    erro
                );
            }
        }
    );
}

// ======================================================
// ERROS
// ======================================================

function exibirErroHome() {
    [
        "homeCategorias",
        "homePromocoes",
        "homeMaisVendidos"
    ].forEach((id) => {
        const container =
            document.getElementById(id);

        if (container) {
            exibirErroContainerHome(
                container
            );
        }
    });
}

function exibirErroContainerHome(container) {
    container.innerHTML = `
        <p class="mensagem-erro">
            Não foi possível carregar este conteúdo.
        </p>
    `;
}

// ======================================================
// LINKS E CAMINHOS
// ======================================================

function obterLinkWhatsAppHome() {
    const linkPronto =
        String(
            homeConfiguracoes.whatsapp_url ||
            ""
        ).trim();

    if (linkPronto) {
        return linkPronto;
    }

    const numero =
        String(
            homeConfiguracoes.whatsapp ||
            homeConfiguracoes.telefone ||
            ""
        ).replace(/\D/g, "");

    if (!numero) {
        return "";
    }

    const numeroCompleto =
        numero.startsWith("55")
            ? numero
            : `55${numero}`;

    return `https://wa.me/${numeroCompleto}`;
}

function obterLinkInstagramHome(valor) {
    const instagram =
        String(valor || "").trim();

    if (!instagram) {
        return "";
    }

    if (
        instagram.startsWith("http://") ||
        instagram.startsWith("https://")
    ) {
        return instagram;
    }

    const usuario =
        instagram
            .replace(/^@/, "")
            .replace(/\s/g, "");

    return usuario
        ? `https://www.instagram.com/${usuario}/`
        : "";
}

function obterCaminhoImagemHome(
    imagem,
    pastaPadrao = ""
) {
    const valor =
        String(imagem || "").trim();

    if (!valor) {
        return "";
    }

    if (
        valor.startsWith("http://") ||
        valor.startsWith("https://") ||
        valor.startsWith("data:") ||
        valor.startsWith("/")
    ) {
        return valor;
    }

    if (
        valor.startsWith("assets/") ||
        valor.startsWith("./") ||
        valor.startsWith("../")
    ) {
        return valor;
    }

    return `${pastaPadrao}${valor}`;
}

// ======================================================
// AUXILIARES
// ======================================================

function obterNumeroHome(
    valor,
    valorPadrao = 0
) {
    const numero = Number(valor);

    return Number.isFinite(numero) &&
        numero > 0
        ? Math.trunc(numero)
        : valorPadrao;
}

function escaparHTMLHome(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributoHome(valor) {
    return escaparHTMLHome(valor);
}