import { defineStore } from 'pinia';
import api from '../services/api';

// Único store del proyecto: estado global de la aplicación.
export const useAppStore = defineStore('app', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.usuario?.rol === 'admin'
  },

  actions: {
    async login(email, password) {
      const { token, usuario } = await api.auth.login(email, password);
      this.token = token;
      this.usuario = usuario;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      return usuario;
    },

    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  }
});
