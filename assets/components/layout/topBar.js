// ===============================================
// RC DISTRIBUIDORA
// COMPONENTE: BARRA SUPERIOR
// ===============================================

document.addEventListener("DOMContentLoaded", iniciarTopBar);

async function iniciarTopBar() {
    const body = document.body;

    if (!body) {
        return;
    }

    if (document.querySelector(".top-bar")) {
        await preencherTopBar();
        return;
    }

    const topBar = criarTopBar();

    body.insertBefore(topBar, body.firstChild);

    await preencherTopBar();
}

function criarTopBar() {
    const topBar = document.createElement("div");

    topBar.className = "top-bar";

    topBar.innerHTML = `
        <div class="top-bar-content">

            <span class="top-bar-item top-bar-rota">
                <i class="fa-solid fa-truck-fast"></i>

                <span id="topRotaEntrega">
                    Entrega em Anápolis e região
                </span>
            </span>

            <a
                class="top-bar-item"
                id="topTelefone"
                href="#"
                aria-label="Ligar para a RC Distribuidora"
            >
                <i class="fa-solid fa-phone"></i>

                <span>
                    Carregando...
                </span>
            </a>

            <span class="top-bar-item top-bar-horario">
                <i class="fa-solid fa-clock"></i>

                <span id="topHorario">
                    Segunda a sexta, 08:30 às 17:00
                </span>
            </span>

            <a
                class="top-bar-item top-bar-whatsapp"
                id="topWhatsApp"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fazer pedido pelo WhatsApp"
            >
                <i class="fa-brands fa-whatsapp"></i>

                <span>Pedido rápido</span>
            </a>

        </div>
    `;

    return topBar;
}

async function preencherTopBar() {
    try {
        if (typeof carregarConfiguracoes !== "function") {
            console.warn(
                "A função carregarConfiguracoes não está disponível."
            );

            return;
        }

        const config = await carregarConfiguracoes();

        if (!config) {
            return;
        }

        preencherRotaTopBar(config);
        preencherTelefoneTopBar(config);
        preencherHorarioTopBar(config);
        preencherWhatsAppTopBar(config);
    } catch (erro) {
        console.error(
            "Erro ao carregar a barra superior:",
            erro
        );
    }
}

function preencherRotaTopBar(config) {
    const elemento =
        document.getElementById("topRotaEntrega");

    if (!elemento) {
        return;
    }

    const rota =
        config.rota_entrega ||
        config.area_entrega ||
        "Anápolis e região";

    elemento.textContent = `Entrega em ${rota}`;
}

function preencherTelefoneTopBar(config) {
    const link =
        document.getElementById("topTelefone");

    if (!link) {
        return;
    }

    const telefone =
        config.telefone ||
        config.whatsapp ||
        "";

    const numeros =
        somenteNumerosTopBar(telefone);

    if (!numeros) {
        link.hidden = true;
        return;
    }

    link.hidden = false;

    const numeroSemPais =
        removerCodigoBrasilTopBar(numeros);

    link.href = `tel:+55${numeroSemPais}`;

    const texto =
        link.querySelector("span");

    if (texto) {
        texto.textContent =
            formatarTelefoneTopBar(numeroSemPais);
    }
}

function preencherHorarioTopBar(config) {
    const elemento =
        document.getElementById("topHorario");

    if (!elemento) {
        return;
    }

    const horario =
        config.horario_seg_sex ||
        "08:30 às 17:00";

    elemento.textContent =
        `Segunda a sexta, ${horario}`;
}

function preencherWhatsAppTopBar(config) {
    const link =
        document.getElementById("topWhatsApp");

    if (!link) {
        return;
    }

    const whatsapp =
        somenteNumerosTopBar(
            config.whatsapp ||
            config.telefone ||
            ""
        );

    if (!whatsapp) {
        link.hidden = true;
        return;
    }

    link.hidden = false;

    const numeroComPais =
        whatsapp.startsWith("55")
            ? whatsapp
            : `55${whatsapp}`;

    const mensagem =
        encodeURIComponent(
            config.pedido_whatsapp_mensagem ||
            "Olá! Gostaria de fazer um pedido pela RC Distribuidora."
        );

    link.href =
        `https://wa.me/${numeroComPais}?text=${mensagem}`;
}

function somenteNumerosTopBar(valor) {
    return String(valor || "")
        .replace(/\D/g, "");
}

function removerCodigoBrasilTopBar(numero) {
    if (
        numero.startsWith("55") &&
        numero.length >= 12
    ) {
        return numero.slice(2);
    }

    return numero;
}

function formatarTelefoneTopBar(numero) {
    if (numero.length === 11) {
        return numero.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );
    }

    if (numero.length === 10) {
        return numero.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );
    }

    return numero;
}