import axios from 'axios';

export const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

// monta a URL completa da imagem de um produto
export const urlImagem = (nome) => (nome ? `${API_URL}/uploads/${nome}` : null);

export default api;
