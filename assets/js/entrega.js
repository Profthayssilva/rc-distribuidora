// ===============================================
// RC DISTRIBUIDORA
// ENTREGA
// ===============================================

document.addEventListener("DOMContentLoaded", iniciarEntrega);

async function iniciarEntrega() {
    try {

        const config = await carregarConfiguracoes();

        configurarPagina(config);
        configurarInformacoes(config);
        configurarHorarios(config);
        configurarEndereco(config);
        configurarCondicoes(config);
        configurarRotas(config);
        configurarMapa(config);
        configurarWhatsApp(config);

    } catch (erro) {
        console.error("Erro ao carregar página de entrega:", erro);
    }
}

// ===============================================
// PÁGINA
// ===============================================

function configurarPagina(config) {

    document.title =
        `Entrega | ${config.nome_empresa || "RC Distribuidora"}`;

    const logo = document.querySelector(".logo img");

    if (logo && config.logo) {
        logo.src = `../assets/img/${config.logo}`;
    }

}

// ===============================================
// INFORMAÇÕES
// ===============================================

function configurarInformacoes(config) {

    preencher("infoEntrega",
        config.entrega === "Sim"
            ? "Disponível"
            : "Consulte disponibilidade");

    preencher("infoRetirada",
        config.retirada === "Sim"
            ? "Disponível na loja"
            : "Consulte disponibilidade");

    preencher(
        "infoRotaEntrega",
        config.rota_entrega || "Consulte"
    );

    preencher(
        "infoAreaEntrega",
        config.area_entrega || "Consulte"
    );

}

// ===============================================
// HORÁRIOS
// ===============================================

function configurarHorarios(config) {

    preencher(
        "horarioSegSex",
        config.horario_seg_sex || "08:30 às 17:00"
    );

    preencher(
        "horarioSab",
        config.horario_sab || "08:30 às 12:00"
    );

    preencher(
        "horarioDom",
        config.horario_dom || "Fechado"
    );

}

// ===============================================
// ENDEREÇO
// ===============================================

function configurarEndereco(config) {

    const endereco = [
        config.endereco,
        config.bairro,
        `${config.cidade || ""} - ${config.estado || ""}`
    ]
        .filter(Boolean)
        .join(", ");

    preencher("infoEndereco", endereco);

    const link = document.getElementById("linkEnderecoEntrega");

    if (link && endereco) {

        link.hidden = false;

        link.href =
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

    }

}

// ===============================================
// CONDIÇÕES
// ===============================================

function configurarCondicoes(config) {

    preencher(
        "infoPedidoMinimo",
        config.pedido_minimo || "Consulte"
    );

    preencher(
        "infoTaxaEntrega",
        config.taxa_entrega || "Consulte"
    );

    preencher(
        "infoFreteGratis",
        config.valor_frete_gratis || "Consulte"
    );

}

// ===============================================
// ROTAS
// ===============================================

function configurarRotas(config) {

    preencher("rotaSegunda", config.rota_segunda || "-");

    preencher("rotaTerca", config.rota_terca || "-");

    preencher("rotaQuarta", config.rota_quarta || "-");

    preencher("rotaQuinta", config.rota_quinta || "-");

    preencher("rotaSexta", config.rota_sexta || "-");

    preencher("rotaSabado", config.rota_sabado || "-");

}

// ===============================================
// MAPA
// ===============================================

function configurarMapa(config) {

    const iframe =
        document.getElementById("googleMapsEntrega");

    const secao =
        document.getElementById("secaoMapaEntrega");

    if (!iframe) return;

    if (!config.google_maps) return;

    iframe.src = config.google_maps;

    if (secao) {
        secao.hidden = false;
    }

}

// ===============================================
// WHATSAPP
// ===============================================

function configurarWhatsApp(config) {

    const numero =
        String(
            config.whatsapp ||
            "5562981455074"
        ).replace(/\D/g, "");

    const mensagem = encodeURIComponent(
        "Olá! Gostaria de consultar a entrega da RC Distribuidora."
    );

    const url =
        `https://wa.me/${numero}?text=${mensagem}`;

    const link1 =
        document.getElementById("linkWhatsEntrega");

    const link2 =
        document.getElementById("btnWhatsEntrega");

    if (link1) link1.href = url;

    if (link2) link2.href = url;

}

// ===============================================
// AUXILIAR
// ===============================================

function preencher(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }

}