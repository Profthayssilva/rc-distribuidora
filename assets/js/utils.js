// ================================
// UTILITÁRIOS GERAIS DO SISTEMA
// ================================

function formatarPreco(valor) {

    const numero = Number(valor);

    if (isNaN(numero))
        return "R$ 0,00";

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

function slug(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

}

function debounce(func, tempo = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            func(...args);

        }, tempo);

    }

}

function carregarImagem(produto) {

    if (
        produto.imagem &&
        produto.imagem.trim() !== ""
    ) {

        return produto.imagem;

    }

    return "sem-imagem.webp";

}