let cacheBanners = null;

async function carregarBanners(force = false) {
    if (cacheBanners && !force) {
        return cacheBanners;
    }

    const dados = await buscarAba("Banners");

    cacheBanners = dados
        .filter(banner => banner.ativo && banner.ativo.toLowerCase() === "sim")
        .sort((a, b) => Number(a.ordem) - Number(b.ordem));

    return cacheBanners;
}