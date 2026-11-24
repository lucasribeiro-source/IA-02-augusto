// Produtos/index.js
import { useEffect, useRef, useState } from "react";
import InputGroup from "../../components/inputGroup";
import useProduto from "../../hooks/useProduto";
import { urlImagem } from "../../util/api";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png"];
const TAMANHO_MAX = 5 * 1024 * 1024; // 5MB

const Produtos = () => {
    const [produto, setProduto] = useState({ nome: "", preco: "" });
    const [imagem, setImagem] = useState(null);          // nova imagem escolhida (data URL)
    const [imagemAtual, setImagemAtual] = useState(null); // imagem já salva (ao editar)
    const [editandoId, setEditandoId] = useState(null);
    const [lstProdutos, setLstProdutos] = useState([]);
    const inputArquivo = useRef(null);
    const { getAll, create, update, remove } = useProduto();

    async function carregar() {
        try {
            setLstProdutos(await getAll());
        } catch (err) {
            alert("Erro ao carregar os produtos. A API está rodando?");
        }
    }

    useEffect(() => {
        carregar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function validateProduto(produto) {
        if (!produto.nome || !produto.nome.trim()) {
            alert("O campo Nome é obrigatório");
            return false;
        }

        if (produto.preco === "" || produto.preco === undefined) {
            alert("O campo Preço é obrigatório");
            return false;
        }

        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }

        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value });
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
            alert("Formato inválido! Envie apenas imagens .jpeg ou .png");
            e.target.value = "";
            return;
        }
        if (arquivo.size > TAMANHO_MAX) {
            alert("A imagem deve ter no máximo 5MB");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImagem(reader.result);
        reader.readAsDataURL(arquivo);
    }

    function limparFormulario() {
        setProduto({ nome: "", preco: "" });
        setImagem(null);
        setImagemAtual(null);
        setEditandoId(null);
        if (inputArquivo.current) inputArquivo.current.value = "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateProduto(produto)) return;

        const dados = { nome: produto.nome.trim(), preco: produto.preco };
        if (imagem) dados.imagem = imagem;

        try {
            if (editandoId) {
                await update(editandoId, dados);
            } else {
                await create(dados);
            }
            limparFormulario();
            carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao salvar o produto");
        }
    }

    function handleEditar(p) {
        setEditandoId(p.id);
        setProduto({ nome: p.nome, preco: p.preco });
        setImagem(null);
        setImagemAtual(p.imagem);
        if (inputArquivo.current) inputArquivo.current.value = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleExcluir(p) {
        if (!window.confirm(`Excluir o produto "${p.nome}"?`)) return;
        try {
            await remove(p.id);
            if (editandoId === p.id) limparFormulario();
            carregar();
        } catch (err) {
            alert(err.response?.data?.message || "Erro ao excluir o produto");
        }
    }

    const preview = imagem || urlImagem(imagemAtual);

    return (
        <div className="container">
            <h1 className="text-center fs-4 mt-3">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup
                        label="Nome"
                        onChange={handleChange}
                        type="text"
                        placeholder="Nome do Produto"
                        name="nome"
                        value={produto.nome} />
                    <InputGroup
                        label="Preço"
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Preço do Produto"
                        name="preco"
                        value={produto.preco} />

                    <div className="input-group mb-3">
                        <span className="input-group-text">Imagem</span>
                        <input
                            ref={inputArquivo}
                            className="form-control"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleImagem} />
                    </div>

                    {preview && (
                        <img src={preview} alt="Pré-visualização"
                            className="img-thumbnail mb-3" style={{ maxHeight: 120 }} />
                    )}

                    <div>
                        <button className="btn btn-primary" type="submit">
                            {editandoId ? "Atualizar" : "Salvar"}
                        </button>
                        {editandoId && (
                            <button className="btn btn-secondary ms-2" type="button"
                                onClick={limparFormulario}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <table className="table table-striped mt-3 align-middle">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {lstProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center">Nenhum produto cadastrado</td>
                        </tr>
                    ) : (
                        lstProdutos.map((p) => (
                            <tr key={p.id}>
                                <td style={{ width: 80 }}>
                                    {p.imagem ? (
                                        <img src={urlImagem(p.imagem)} alt={p.nome}
                                            style={{ height: 48, width: 48, objectFit: "cover" }} />
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td>{p.nome}</td>
                                <td>R$ {Number(p.preco).toFixed(2)}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => handleEditar(p)}>Editar</button>
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleExcluir(p)}>Excluir</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Produtos;
