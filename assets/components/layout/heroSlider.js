function criarHeroSlide(banner, ativo = false) {
    return `
        <div
            class="hero-slide ${ativo ? "active" : ""}"
            style="background-image: url('${banner.imagem}');">

            <div class="hero-text">
                <h1>${banner.titulo}</h1>
                <p>${banner.subtitulo}</p>

                <a href="${banner.link}" class="btn-hero">
                    ${banner.botao}
                    <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}