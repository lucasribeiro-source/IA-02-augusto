import api from '../util/api';

function useCarrinho(){
    async function getAll() {
        const response = await api.get('/Carrinho/getAll');
        return response.data;
    }
    async function add(produtoId, quantidade = 1) {
        const response = await api.post('/Carrinho/add', { produtoId, quantidade });
        return response.data;
    }
    async function update(id, quantidade) {
        const response = await api.patch(`/Carrinho/update/${id}`, { quantidade });
        return response.data;
    }
    async function remove(id) {
        const response = await api.delete(`/Carrinho/delete/${id}`);
        return response.data;
    }
    async function clear() {
        const response = await api.delete('/Carrinho/clear');
        return response.data;
    }

    return {getAll, add, update, remove, clear, };
}

export default useCarrinho;
