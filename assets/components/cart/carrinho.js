// ======================================================
// RC DISTRIBUIDORA
// CARRINHO + WHATSAPP
// ======================================================

let carrinho = carregarCarrinhoSalvo();

// ======================================================
// ELEMENTOS
// ======================================================

const carrinhoLateral =
    document.getElementById("carrinhoLateral");

const carrinhoOverlay =
    document.getElementById("carrinhoOverlay");

const abrirCarrinho =
    document.getElementById("abrirCarrinho");

const fecharCarrinho =
    document.getElementById("fecharCarrinho");

const listaCarrinho =
    document.getElementById("listaCarrinho");

const contadorCarrinho =
    document.getElementById("contadorCarrinho");

const totalCarrinho =
    document.getElementById("totalCarrinho");

const enviarWhatsApp =
    document.getElementById("enviarWhatsApp");

// ======================================================
// EVENTOS
// ======================================================

if (abrirCarrinho) {
    abrirCarrinho.addEventListener(
        "click",
        abrirPainelCarrinho
    );
}

if (fecharCarrinho) {
    fecharCarrinho.addEventListener(
        "click",
        fecharPainelCarrinho
    );
}

if (carrinhoOverlay) {
    carrinhoOverlay.addEventListener(
        "click",
        fecharPainelCarrinho
    );
}

if (enviarWhatsApp) {
    enviarWhatsApp.addEventListener(
        "click",
        finalizarPedidoWhatsApp
    );
}

document.addEventListener("change", (evento) => {
    if (evento.target.name === "tipoPedido") {
        atualizarCarrinho();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharPainelCarrinho();
    }
});

if (listaCarrinho) {
    listaCarrinho.addEventListener(
        "click",
        tratarCliqueCarrinho
    );
}

document.addEventListener(
    "DOMContentLoaded",
    atualizarCarrinho
);

// ======================================================
// ABRIR E FECHAR CARRINHO
// ======================================================

function abrirPainelCarrinho() {
    if (carrinhoLateral) {
        carrinhoLateral.classList.add("aberto");
    }

    if (carrinhoOverlay) {
        carrinhoOverlay.classList.add("aberto");
    }

    document.body.classList.add("carrinho-aberto");
}

function fecharPainelCarrinho() {
    if (carrinhoLateral) {
        carrinhoLateral.classList.remove("aberto");
    }

    if (carrinhoOverlay) {
        carrinhoOverlay.classList.remove("aberto");
    }

    document.body.classList.remove("carrinho-aberto");
}

// ======================================================
// ADICIONAR PRODUTO
// ======================================================

async function adicionarAoCarrinho(produtoOuId) {
    try {
        let produto = produtoOuId;

        if (
            typeof produtoOuId !== "object" ||
            produtoOuId === null
        ) {
            if (typeof buscarProduto !== "function") {
                console.error(
                    "A função buscarProduto não está disponível."
                );

                return;
            }

            produto = await buscarProduto(produtoOuId);
        }

        if (!produto) {
            console.warn(
                "Produto não encontrado:",
                produtoOuId
            );

            return;
        }

        const id = obterIdProduto(produto);

        if (id === "") {
            console.warn(
                "Produto sem identificador:",
                produto
            );

            return;
        }

        const itemExistente = carrinho.find(
            (item) =>
                String(obterIdProduto(item)) ===
                String(id)
        );

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({
                ...produto,
                id,
                quantidade: 1
            });
        }

        salvarCarrinho();
        atualizarCarrinho();
        abrirPainelCarrinho();

    } catch (erro) {
        console.error(
            "Erro ao adicionar produto ao carrinho:",
            erro
        );
    }
}

// ======================================================
// ALTERAR QUANTIDADE
// ======================================================

function alterarQuantidade(id, acao) {
    const item = carrinho.find(
        (produto) =>
            String(obterIdProduto(produto)) ===
            String(id)
    );

    if (!item) {
        return;
    }

    if (acao === "mais") {
        item.quantidade += 1;
    }

    if (acao === "menos") {
        item.quantidade -= 1;
    }

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);

        return;
    }

    salvarCarrinho();
    atualizarCarrinho();
}

// ======================================================
// REMOVER PRODUTO
// ======================================================

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(
        (item) =>
            String(obterIdProduto(item)) !==
            String(id)
    );

    salvarCarrinho();
    atualizarCarrinho();
}

// ======================================================
// CLIQUES DO CARRINHO
// ======================================================

function tratarCliqueCarrinho(evento) {
    const botao =
        evento.target.closest(
            "[data-acao-carrinho]"
        );

    if (!botao) {
        return;
    }

    const id =
        botao.dataset.id;

    const acao =
        botao.dataset.acaoCarrinho;

    if (acao === "mais" || acao === "menos") {
        alterarQuantidade(id, acao);

        return;
    }

    if (acao === "remover") {
        removerDoCarrinho(id);
    }
}

// ======================================================
// TIPO DE PEDIDO
// ======================================================

function tipoPedidoAtual() {
    return (
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        )?.value ||
        "Retirada na loja"
    );
}

// ======================================================
// PREÇO UTILIZADO
// ======================================================

function precoUsado(item) {
    const tipoPedido =
        tipoPedidoAtual();

    let valor;

    if (tipoPedido === "Retirada na loja") {
        valor =
            item.preco_loja ??
            item.preco ??
            item.preco_entrega;
    } else {
        valor =
            item.preco_entrega ??
            item.preco ??
            item.preco_loja;
    }

    return converterValorNumerico(valor);
}

// ======================================================
// ATUALIZAR CARRINHO
// ======================================================

function atualizarCarrinho() {
    const quantidadeTotal =
        carrinho.reduce(
            (total, item) =>
                total +
                Number(item.quantidade || 0),
            0
        );

    if (contadorCarrinho) {
        contadorCarrinho.textContent =
            quantidadeTotal;
    }

    if (!listaCarrinho) {
        return;
    }

    if (!carrinho.length) {
        listaCarrinho.innerHTML = `
            <p class="carrinho-vazio">
                Nenhum produto adicionado.
            </p>
        `;

        if (totalCarrinho) {
            totalCarrinho.textContent =
                "R$ 0,00";
        }

        return;
    }

    listaCarrinho.innerHTML =
        carrinho
            .map((item) =>
                criarItemCarrinho(item)
            )
            .join("");

    if (totalCarrinho) {
        totalCarrinho.textContent =
            calcularTotalCarrinho();
    }
}

// ======================================================
// CRIAR ITEM DO CARRINHO
// ======================================================

function criarItemCarrinho(item) {
    const id =
        escaparAtributo(
            obterIdProduto(item)
        );

    const marca =
        escaparHTML(item.marca || "");

    const nome =
        escaparHTML(
            item.produto ||
            item.nome ||
            "Produto"
        );

    const volume =
        escaparHTML(item.volume || "");

    const quantidade =
        Number(item.quantidade || 1);

    return `
        <div class="item-carrinho">

            <div class="item-carrinho-info">

                <strong>
                    ${marca} ${nome}
                </strong>

                ${
                    volume
                        ? `<span>${volume}</span>`
                        : ""
                }

                <div class="item-precos">

                    <small>
                        Loja:
                        <b>
                            ${formatarPrecoSeguro(
                                item.preco_loja
                            )}
                        </b>
                    </small>

                    <small>
                        Entrega:
                        <b>
                            ${formatarPrecoSeguro(
                                item.preco_entrega
                            )}
                        </b>
                    </small>

                </div>

                <small class="preco-usado">
                    Usando agora:
                    ${formatarPrecoSeguro(
                        precoUsado(item)
                    )}
                </small>

            </div>

            <div class="item-carrinho-actions">

                <button
                    type="button"
                    data-acao-carrinho="menos"
                    data-id="${id}"
                    aria-label="Diminuir quantidade"
                >
                    −
                </button>

                <span>
                    ${quantidade}
                </span>

                <button
                    type="button"
                    data-acao-carrinho="mais"
                    data-id="${id}"
                    aria-label="Aumentar quantidade"
                >
                    +
                </button>

                <button
                    type="button"
                    class="btn-remover"
                    data-acao-carrinho="remover"
                    data-id="${id}"
                    aria-label="Remover produto"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

        </div>
    `;
}

// ======================================================
// TOTAL
// ======================================================

function calcularTotalNumerico() {
    return carrinho.reduce(
        (soma, item) => {
            const quantidade =
                Number(item.quantidade || 0);

            return (
                soma +
                precoUsado(item) * quantidade
            );
        },
        0
    );
}

function calcularTotalCarrinho() {
    return formatarPrecoSeguro(
        calcularTotalNumerico()
    );
}

// ======================================================
// FINALIZAR PEDIDO NO WHATSAPP
// ======================================================

async function finalizarPedidoWhatsApp() {
    if (!carrinho.length) {
        alert(
            "Adicione pelo menos um produto ao pedido."
        );

        return;
    }

    try {
        if (
            typeof carregarConfiguracoes !==
            "function"
        ) {
            throw new Error(
                "A função carregarConfiguracoes não está disponível."
            );
        }

        const config =
            await carregarConfiguracoes();

        const tipoPedido =
            tipoPedidoAtual();

        const nomeEmpresa =
            config.nome_empresa ||
            "RC Distribuidora";

        const numero =
            limparNumeroWhatsApp(
                config.whatsapp ||
                "5562981455074"
            );

        if (!numero) {
            alert(
                "O número do WhatsApp não está configurado."
            );

            return;
        }

        const linhasProdutos =
            carrinho.map((item) => {
                const quantidade =
                    Number(item.quantidade || 1);

                const nomeProduto = [
                    item.marca,
                    item.produto || item.nome,
                    item.volume
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                const valorUnitario =
                    formatarPrecoSeguro(
                        precoUsado(item)
                    );

                const subtotal =
                    formatarPrecoSeguro(
                        precoUsado(item) *
                        quantidade
                    );

                return (
                    `• ${quantidade}x ` +
                    `${nomeProduto}\n` +
                    `  Unitário: ${valorUnitario}\n` +
                    `  Subtotal: ${subtotal}`
                );
            });

        const mensagem = [
            `Olá! Quero fazer um pedido na ${nomeEmpresa}.`,
            "",
            ...linhasProdutos,
            "",
            `Tipo de pedido: ${tipoPedido}`,
            `Total aproximado: ${calcularTotalCarrinho()}`,
            "",
            "Pedido enviado pelo catálogo online."
        ].join("\n");

        const url =
            `https://wa.me/${numero}` +
            `?text=${encodeURIComponent(mensagem)}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    } catch (erro) {
        console.error(
            "Erro ao finalizar pedido:",
            erro
        );

        alert(
            "Não foi possível enviar o pedido. Tente novamente."
        );
    }
}

// ======================================================
// LOCALSTORAGE
// ======================================================

function carregarCarrinhoSalvo() {
    try {
        const salvo =
            localStorage.getItem(
                "rc_distribuidora_carrinho"
            );

        if (!salvo) {
            return [];
        }

        const dados =
            JSON.parse(salvo);

        if (!Array.isArray(dados)) {
            return [];
        }

        return dados
            .filter(Boolean)
            .map((item) => ({
                ...item,
                quantidade:
                    Math.max(
                        1,
                        Number(
                            item.quantidade || 1
                        )
                    )
            }));

    } catch (erro) {
        console.warn(
            "Não foi possível recuperar o carrinho:",
            erro
        );

        return [];
    }
}

function salvarCarrinho() {
    try {
        localStorage.setItem(
            "rc_distribuidora_carrinho",
            JSON.stringify(carrinho)
        );

    } catch (erro) {
        console.warn(
            "Não foi possível salvar o carrinho:",
            erro
        );
    }
}

// ======================================================
// AUXILIARES
// ======================================================

function obterIdProduto(produto) {
    return (
        produto?.id ??
        produto?.codigo ??
        produto?.produto_id ??
        ""
    );
}

function converterValorNumerico(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor)
            ? valor
            : 0;
    }

    let texto =
        String(valor || "")
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
        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");
    } else if (texto.includes(",")) {
        texto =
            texto.replace(",", ".");
    }

    const numero =
        Number(texto);

    return Number.isFinite(numero)
        ? numero
        : 0;
}

function formatarPrecoSeguro(valor) {
    const numero =
        converterValorNumerico(valor);

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

function limparNumeroWhatsApp(numero) {
    let somenteNumeros =
        String(numero || "")
            .replace(/\D/g, "");

    if (
        somenteNumeros.length === 10 ||
        somenteNumeros.length === 11
    ) {
        somenteNumeros =
            `55${somenteNumeros}`;
    }

    return somenteNumeros;
}

function escaparHTML(valor) {
    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributo(valor) {
    return escaparHTML(valor);
}