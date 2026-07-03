const produtosGrid = document.querySelector(".produtos-grid");
const campoBusca = document.getElementById("campoBusca");

let listaProdutos = [];

fetch("../database/produtos.json")
  .then(resposta => resposta.json())
  .then(produtos => {
    listaProdutos = produtos.filter(produto => produto.ativo === "sim");
    mostrarProdutos(listaProdutos);
  });

function mostrarProdutos(produtos) {
  produtosGrid.innerHTML = "";

  produtos.forEach(produto => {
    produtosGrid.innerHTML += `
      <div class="produto-card">
        <div class="produto-img">🥃</div>
        <h3>${produto.produto}</h3>
        <p>${produto.categoria}</p>

        <div class="precos">
          <span>Loja: <strong>R$ ${produto.preco_loja.toFixed(2).replace(".", ",")}</strong></span>
          <span>Entrega: <strong>R$ ${produto.preco_entrega.toFixed(2).replace(".", ",")}</strong></span>
        </div>

        <button>Adicionar</button>
      </div>
    `;
  });
}

campoBusca.addEventListener("input", () => {
  const texto = campoBusca.value.toLowerCase();

  const filtrados = listaProdutos.filter(produto =>
    produto.produto.toLowerCase().includes(texto) ||
    produto.categoria.toLowerCase().includes(texto)
  );

  mostrarProdutos(filtrados);
});