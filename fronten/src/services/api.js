import axios from 'axios';

// Cliente HTTP central para el backend (CatalogoBulk).
// En desarrollo, Vite redirige '/api' a http://localhost:3000 (ver vite.config.js).
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adjunta el token JWT (Authorization: Bearer <token>) a cada petición.
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Limpia el token si el backend responde 401 (token inválido/expirado).
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Único servicio del proyecto: agrupa todas las llamadas a la API del backend.
const api = {
  auth: {
    login: (email, password) =>
      http.post('/auth/login', { email, password }).then((res) => res.data),
    register: (datos) =>
      http.post('/auth/register', datos).then((res) => res.data)
  },

  proveedores: {
    list: (params = {}) =>
      http.get('/proveedores', { params }).then((res) => res.data),
    get: (id) => http.get(`/proveedores/${id}`).then((res) => res.data),
    create: (datos) => http.post('/proveedores', datos).then((res) => res.data),
    update: (id, datos) =>
      http.put(`/proveedores/${id}`, datos).then((res) => res.data),
    remove: (id) => http.delete(`/proveedores/${id}`)
  },

  categorias: {
    list: (params = {}) =>
      http.get('/categorias', { params }).then((res) => res.data),
    get: (id) => http.get(`/categorias/${id}`).then((res) => res.data),
    create: (datos) => http.post('/categorias', datos).then((res) => res.data),
    update: (id, datos) =>
      http.put(`/categorias/${id}`, datos).then((res) => res.data)
  },

  productos: {
    list: (params = {}) =>
      http.get('/productos', { params }).then((res) => res.data),
    get: (id) => http.get(`/productos/${id}`).then((res) => res.data),
    create: (datos) => http.post('/productos', datos).then((res) => res.data),
    update: (id, datos) =>
      http.put(`/productos/${id}`, datos).then((res) => res.data),
    remove: (id) => http.delete(`/productos/${id}`),
    stats: () => http.get('/productos/stats').then((res) => res.data)
  },

  usuarios: {
    list: (params = {}) =>
      http.get('/usuarios', { params }).then((res) => res.data),
    get: (id) => http.get(`/usuarios/${id}`).then((res) => res.data),
    create: (datos) => http.post('/usuarios', datos).then((res) => res.data),
    update: (id, datos) =>
      http.put(`/usuarios/${id}`, datos).then((res) => res.data),
    remove: (id) => http.delete(`/usuarios/${id}`)
  }
};

export default api;
