// ======================================================
// RC DISTRIBUIDORA
// APP GLOBAL
// Funções gerais usadas no site inteiro
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    ativarHeaderScroll();
});

// ======================================================
// Header com efeito ao rolar
// ======================================================

function ativarHeaderScroll() {
    const header = document.querySelector(".site-header");

    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            header.classList.add("header-scroll");
        } else {
            header.classList.remove("header-scroll");
        }
    });
}

// ===============================================
// BARRA SUPERIOR DINÂMICA
// ===============================================

document.addEventListener("DOMContentLoaded", carregarBarraSuperior);

async function carregarBarraSuperior() {
    try {
        if (typeof carregarConfiguracoes !== "function") {
            return;
        }

        const config = await carregarConfiguracoes();

        if (!config) {
            return;
        }

        configurarRotaEntrega(config);
        configurarTelefone(config);
        configurarHorario(config);
        configurarWhatsApp(config);
    } catch (erro) {
        console.error("Erro ao carregar barra superior:", erro);
    }
}

function configurarRotaEntrega(config) {
    const elemento = document.getElementById("topRotaEntrega");

    if (!elemento) {
        return;
    }

    const rota =
        config.rota_entrega ||
        config.area_entrega ||
        "Anápolis e região";

    elemento.textContent = `Entrega em ${rota}`;
}

function configurarTelefone(config) {
    const link = document.getElementById("topTelefone");

    if (!link) {
        return;
    }

    const telefone =
        config.telefone ||
        config.whatsapp ||
        "";

    if (!telefone) {
        link.style.display = "none";
        return;
    }

    const telefoneNumeros = somenteNumerosApp(telefone);

    link.href = `tel:+55${removerCodigoBrasilApp(telefoneNumeros)}`;

    const texto = link.querySelector("span");

    if (texto) {
        texto.textContent = formatarTelefoneApp(telefoneNumeros);
    }
}

function configurarHorario(config) {
    const elemento = document.getElementById("topHorario");

    if (!elemento) {
        return;
    }

    const horario =
        config.horario_seg_sex ||
        "08:30 às 17:00";

    elemento.textContent = `Segunda a sexta, ${horario}`;
}

function configurarWhatsApp(config) {
    const link = document.getElementById("topWhatsApp");

    if (!link) {
        return;
    }

    const whatsapp = somenteNumerosApp(
        config.whatsapp ||
        config.telefone ||
        ""
    );

    if (!whatsapp) {
        link.style.display = "none";
        return;
    }

    const numeroComPais = whatsapp.startsWith("55")
        ? whatsapp
        : `55${whatsapp}`;

    const mensagem = encodeURIComponent(
        config.pedido_whatsapp_mensagem ||
        "Olá! Gostaria de fazer um pedido pela RC Distribuidora."
    );

    link.href = `https://wa.me/${numeroComPais}?text=${mensagem}`;
}

function somenteNumerosApp(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function removerCodigoBrasilApp(numero) {
    if (numero.startsWith("55") && numero.length >= 12) {
        return numero.slice(2);
    }

    return numero;
}

function formatarTelefoneApp(valor) {
    const numero = removerCodigoBrasilApp(
        somenteNumerosApp(valor)
    );

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

    return valor;
}