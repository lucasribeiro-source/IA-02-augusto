//Home/Index.js
// Painel de vendas (e-commerce): vitrine de produtos + carrinho + finalização da venda
import { useEffect, useState } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import useVenda from "../../hooks/useVenda";
import { urlImagem } from "../../util/api";

const moeda = (valor) => `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;

const Home = () => {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState({ itens: [], total: 0 });
    const [vendaFeita, setVendaFeita] = useState(null);
    const produtoApi = useProduto();
    const carrinhoApi = useCarrinho();
    const vendaApi = useVenda();

    useEffect(() => {
        async function carregar() {
            try {
                setProdutos(await produtoApi.getAll());
                setCarrinho(await carrinhoApi.getAll());
            } catch (err) {
                alert("Erro ao carregar os dados. A API está rodando?");
            }
        }
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // executa uma ação no carrinho e atualiza o estado com a resposta da API
    async function acao(fn) {
        try {
            setCarrinho(await fn());
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao atualizar o carrinho");
        }
    }

    async function finalizar() {
        try {
            const { venda } = await vendaApi.finalizar();
            setVendaFeita(venda);
            setCarrinho({ itens: [], total: 0 });
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao finalizar a venda");
        }
    }

    const qtdItens = carrinho.itens.reduce((s, i) => s + i.quantidade, 0);

    return (
        <div className="container mt-3">
            <h1 className="fs-4 mb-3">Loja</h1>

            {vendaFeita && (
                <div className="alert alert-success alert-dismissible">
                    Compra #{vendaFeita.id} finalizada com sucesso! Total: {moeda(vendaFeita.total)}
                    <button type="button" className="btn-close" onClick={() => setVendaFeita(null)} />
                </div>
            )}

            <div className="row">
                {/* Vitrine */}
                <div className="col-lg-8">
                    <div className="row g-3">
                        {produtos.length === 0 && (
                            <p className="text-muted">Nenhum produto cadastrado. Cadastre em "Produtos".</p>
                        )}
                        {produtos.map((p) => (
                            <div className="col-6 col-md-4" key={p.id}>
                                <div className="card h-100">
                                    {p.imagem ? (
                                        <img src={urlImagem(p.imagem)} className="card-img-top"
                                            alt={p.nome} style={{ height: 160, objectFit: "cover" }} />
                                    ) : (
                                        <div className="bg-light d-flex align-items-center justify-content-center text-muted"
                                            style={{ height: 160 }}>Sem imagem</div>
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fs-6">{p.nome}</h5>
                                        <p className="card-text fw-bold mt-auto">{moeda(p.preco)}</p>
                                        <button className="btn btn-primary btn-sm"
                                            onClick={() => acao(() => carrinhoApi.add(p.id, 1))}>
                                            Adicionar ao carrinho
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carrinho */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between">
                            <strong>Carrinho</strong>
                            <span className="badge bg-secondary">{qtdItens}</span>
                        </div>
                        <ul className="list-group list-group-flush">
                            {carrinho.itens.length === 0 && (
                                <li className="list-group-item text-muted">Carrinho vazio</li>
                            )}
                            {carrinho.itens.map((item) => (
                                <li className="list-group-item" key={item.id}>
                                    <div className="d-flex justify-content-between">
                                        <span>{item.Produto.nome}</span>
                                        <span>{moeda(item.Produto.preco * item.quantidade)}</span>
                                    </div>
                                    <div className="d-flex align-items-center mt-1">
                                        <button className="btn btn-sm btn-outline-secondary"
                                            disabled={item.quantidade <= 1}
                                            onClick={() => acao(() => carrinhoApi.update(item.id, item.quantidade - 1))}>−</button>
                                        <span className="mx-2">{item.quantidade}</span>
                                        <button className="btn btn-sm btn-outline-secondary"
                                            onClick={() => acao(() => carrinhoApi.update(item.id, item.quantidade + 1))}>+</button>
                                        <button className="btn btn-sm btn-link text-danger ms-auto"
                                            onClick={() => acao(() => carrinhoApi.remove(item.id))}>Remover</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="card-footer">
                            <div className="d-flex justify-content-between mb-2">
                                <strong>Total</strong>
                                <strong>{moeda(carrinho.total)}</strong>
                            </div>
                            <button className="btn btn-success w-100 mb-2"
                                disabled={carrinho.itens.length === 0}
                                onClick={finalizar}>Finalizar compra</button>
                            <button className="btn btn-outline-secondary w-100 btn-sm"
                                disabled={carrinho.itens.length === 0}
                                onClick={() => acao(() => carrinhoApi.clear())}>Esvaziar carrinho</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
