import { createRouter, createWebHashHistory } from 'vue-router';
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
    children: [
      {
        path: 'home',
        redirect: '/admin/home'
      },
      {
        path: 'proveedores',
        redirect: '/admin/proveedores'
      },
      {
        path: 'categorias',
        redirect: '/admin/categorias'
      },
      {
        path: 'productos',
        redirect: '/admin/productos'
      },
      {
        path: 'usuarios',
        redirect: '/admin/usuarios'
      },
      {
        path: '',
        name: 'catalogo',
        component: CatalogoView
      },
      {
        path: 'admin/home',
        name: 'home',
        component: HomeView,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/proveedores',
        name: 'proveedores',
        component: ProveedoresView,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/categorias',
        name: 'categorias',
        component: CategoriasView,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/productos',
        name: 'productos',
        component: ProductosView,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/usuarios',
        name: 'usuarios',
        component: UsuariosView,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: ':pathMatch(.*)*',
        name: 'no-encontrado',
        redirect: { name: 'catalogo' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0 };
  }
});

router.beforeEach((to) => {
  const auth = useAppStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'catalogo' };
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: auth.isAdmin ? 'home' : 'catalogo' };
  }

  return true;
});

export default router;
