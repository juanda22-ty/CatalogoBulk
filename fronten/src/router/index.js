import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import ProveedoresView from '../views/ProveedoresView.vue';
import CategoriasView from '../views/CategoriasView.vue';
import ProductosView from '../views/ProductosView.vue';
import UsuariosView from '../views/UsuariosView.vue';
import CatalogoView from '../views/CatalogoView.vue';
import { useAppStore } from '../store';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView
      },
      {
        path: 'proveedores',
        name: 'proveedores',
        component: ProveedoresView
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: CategoriasView
      },
      {
        path: 'productos',
        name: 'productos',
        component: ProductosView
      },
      {
        path: 'catalogo',
        name: 'catalogo',
        component: CatalogoView
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: UsuariosView,
        meta: { requiresAdmin: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAppStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' };
  }

  return true;
});

export default router;
