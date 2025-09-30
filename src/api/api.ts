import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Adiciona um interceptor que anexa o token de autenticação a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Adiciona o token ao cabeçalho 'Authorization'
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;