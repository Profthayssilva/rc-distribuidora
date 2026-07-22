// ===============================================
// RC DISTRIBUIDORA
// PÁGINA DE CONTATO
// ===============================================

document.addEventListener("DOMContentLoaded", iniciarContato);

async function iniciarContato() {
    try {
        if (typeof carregarConfiguracoes !== "function") {
            throw new Error(
                "A função carregarConfiguracoes não foi encontrada."
            );
        }

        const config = await carregarConfiguracoes();

        if (!config) {
            throw new Error(
                "As configurações não foram carregadas."
            );
        }

        configurarTituloContato(config);
        configurarLogoContato(config);
        configurarWhatsAppContato(config);
        configurarTelefoneContato(config);
        configurarInstagramContato(config);
        configurarEnderecoContato(config);
        configurarHorariosContato(config);
        configurarMapaContato(config);
    } catch (erro) {
        console.error(
            "Erro ao carregar página de contato:",
            erro
        );
    }
}

// ===============================================
// TÍTULO E LOGO
// ===============================================

function configurarTituloContato(config) {
    const empresa =
        config.nome_empresa ||
        "RC Distribuidora";

    document.title = `Contato | ${empresa}`;
}

function configurarLogoContato(config) {
    const logo =
        document.querySelector(".logo img");

    if (!logo || !config.logo) {
        return;
    }

    logo.src = `../assets/img/${config.logo}`;
    logo.alt =
        config.nome_empresa ||
        "RC Distribuidora";
}

// ===============================================
// WHATSAPP
// ===============================================

function configurarWhatsAppContato(config) {
    const numero = somenteNumerosContato(
        config.whatsapp ||
        config.telefone ||
        ""
    );

    const texto =
        document.getElementById("contatoWhats");

    const links = [
        document.getElementById("cardWhats"),
        document.getElementById("linkWhatsContato"),
        document.getElementById("btnWhatsContato")
    ].filter(Boolean);

    if (!numero) {
        if (texto) {
            texto.textContent = "Não informado";
        }

        links.forEach((link) => {
            link.hidden = true;
        });

        return;
    }

    const numeroComPais =
        numero.startsWith("55")
            ? numero
            : `55${numero}`;

    const mensagem = encodeURIComponent(
        config.pedido_whatsapp_mensagem ||
        "Olá! Gostaria de atendimento com a RC Distribuidora."
    );

    const url =
        `https://wa.me/${numeroComPais}?text=${mensagem}`;

    if (texto) {
        texto.textContent =
            formatarTelefoneContato(numero);
    }

    links.forEach((link) => {
        link.href = url;
        link.hidden = false;
    });
}

// ===============================================
// TELEFONE
// ===============================================

function configurarTelefoneContato(config) {
    const elemento =
        document.getElementById("contatoTelefone");

    const link =
        document.getElementById("cardTelefone");

    const numero = somenteNumerosContato(
        config.telefone ||
        config.whatsapp ||
        ""
    );

    if (!numero) {
        if (elemento) {
            elemento.textContent = "Não informado";
        }

        if (link) {
            link.removeAttribute("href");
        }

        return;
    }

    const numeroSemPais =
        removerCodigoBrasilContato(numero);

    if (elemento) {
        elemento.textContent =
            formatarTelefoneContato(numeroSemPais);
    }

    if (link) {
        link.href = `tel:+55${numeroSemPais}`;
    }
}

// ===============================================
// INSTAGRAM
// ===============================================

function configurarInstagramContato(config) {
    const texto =
        document.getElementById("contatoInstagram");

    const link =
        document.getElementById("cardInstagram");

    const instagram =
        config.instagram || "";

    const instagramUrl =
        config.instagram_url || "";

    if (texto) {
        texto.textContent =
            instagram || "Não informado";
    }

    if (!link) {
        return;
    }

    if (!instagramUrl) {
        link.removeAttribute("href");
        return;
    }

    link.href = instagramUrl;
}

// ===============================================
// ENDEREÇO
// ===============================================

function configurarEnderecoContato(config) {
    const elemento =
        document.getElementById("contatoEndereco");

    const link =
        document.getElementById("cardEndereco");

    const endereco =
        montarEnderecoContato(config);

    if (elemento) {
        elemento.textContent =
            endereco || "Endereço não informado";
    }

    if (!link || !endereco) {
        return;
    }

    const destino = encodeURIComponent(endereco);

    link.href =
        `https://www.google.com/maps/search/?api=1&query=${destino}`;

    link.target = "_blank";
    link.rel = "noopener noreferrer";
}

function montarEnderecoContato(config) {
    const partes = [];

    if (config.endereco) {
        partes.push(config.endereco);
    }

    if (config.bairro) {
        partes.push(config.bairro);
    }

    const cidadeEstado = [
        config.cidade,
        config.estado
    ]
        .filter(Boolean)
        .join(" - ");

    if (cidadeEstado) {
        partes.push(cidadeEstado);
    }

    if (config.cep) {
        partes.push(`CEP ${config.cep}`);
    }

    return partes.join(", ");
}

// ===============================================
// HORÁRIOS
// ===============================================

function configurarHorariosContato(config) {
    preencherTextoContato(
        "horarioSegSex",
        config.horario_seg_sex ||
        "08:30 às 17:00"
    );

    preencherTextoContato(
        "horarioSab",
        config.horario_sab ||
        "08:30 às 12:00"
    );

    preencherTextoContato(
        "horarioDom",
        config.horario_dom ||
        "Fechado"
    );
}

// ===============================================
// GOOGLE MAPS
// ===============================================

function configurarMapaContato(config) {
    const iframe =
        document.getElementById("googleMaps");

    const secao =
        document.getElementById("secaoMapaContato");

    if (!iframe) {
        return;
    }

    const mapa =
        corrigirLinkMapaContato(
            config.google_maps || ""
        );

    if (!mapa) {
        iframe.removeAttribute("src");

        if (secao) {
            secao.hidden = true;
        }

        return;
    }

    iframe.src = mapa;

    if (secao) {
        secao.hidden = false;
    }
}

function corrigirLinkMapaContato(url) {
    const link = String(url || "").trim();

    if (!link) {
        return "";
    }

    if (
        link.includes("/embed") ||
        link.includes("output=embed") ||
        link.includes("maps/embed")
    ) {
        return link;
    }

    console.warn(
        "Use o link de incorporação do Google Maps na planilha."
    );

    return "";
}

// ===============================================
// AUXILIARES
// ===============================================

function preencherTextoContato(id, valor) {
    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function somenteNumerosContato(valor) {
    return String(valor || "")
        .replace(/\D/g, "");
}

function removerCodigoBrasilContato(numero) {
    if (
        numero.startsWith("55") &&
        numero.length >= 12
    ) {
        return numero.slice(2);
    }

    return numero;
}

function formatarTelefoneContato(valor) {
    const numero =
        removerCodigoBrasilContato(
            somenteNumerosContato(valor)
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