<template>
  <div class="route-bar" :class="{ 'route-bar--activa': barraVisible }"></div>

  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header text-white">
      <q-toolbar class="app-toolbar q-px-lg">
        <q-btn
          v-if="auth.isAuthenticated"
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          @click="drawer = !drawer"
        />

        <q-toolbar-title class="brand-mark">
          <span class="brand-mark__icon"><q-icon name="inventory_2" /></span>
          <span>Catálogo <b>Bulk</b></span>
        </q-toolbar-title>

        <template v-if="auth.isAuthenticated">
          <q-chip
            icon="account_circle"
            color="white"
            text-color="primary"
            class="user-chip q-mr-sm"
          >
            {{ auth.usuario?.email }}
          </q-chip>

          <q-btn flat round icon="logout" aria-label="Cerrar sesión" @click="onLogout">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="auth.isAuthenticated"
      v-model="drawer"
      show-if-above
      :width="252"
      bordered
      class="app-drawer bg-white"
    >
      <q-list padding>
        <template v-if="auth.isAdmin">
          <q-item-label header class="drawer-kicker">Workspace</q-item-label>

          <q-item :to="{ name: 'home' }" exact active-class="nav-item--active" class="nav-item" clickable>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Inicio</q-item-section>
          </q-item>

          <q-item :to="{ name: 'proveedores' }" active-class="nav-item--active" class="nav-item" clickable>
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section>Proveedores</q-item-section>
          </q-item>

          <q-item :to="{ name: 'categorias' }" active-class="nav-item--active" class="nav-item" clickable>
            <q-item-section avatar>
              <q-icon name="category" />
            </q-item-section>
            <q-item-section>Categorías</q-item-section>
          </q-item>

          <q-item :to="{ name: 'productos' }" active-class="nav-item--active" class="nav-item" clickable>
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section>Productos</q-item-section>
          </q-item>

          <q-item :to="{ name: 'usuarios' }" active-class="nav-item--active" class="nav-item" clickable>
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>Usuarios</q-item-section>
          </q-item>
        </template>

        <q-item :to="{ name: 'catalogo' }" active-class="nav-item--active" class="nav-item" clickable>
          <q-item-section avatar>
            <q-icon name="storefront" />
          </q-item-section>
          <q-item-section>Catálogo</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '../store';
import { useFeedback } from '../composables/useFeedback';

const drawer = ref(false);
const router = useRouter();
const route = useRoute();
const auth = useAppStore();
const { confirmar, notificar } = useFeedback();

const barraVisible = ref(false);

watch(
  () => route.fullPath,
  () => {
    barraVisible.value = false;
    requestAnimationFrame(() => {
      barraVisible.value = true;
    });
  }
);

async function onLogout() {
  const confirmado = await confirmar({
    title: 'Cerrar sesión',
    message: '¿Seguro que quieres cerrar la sesión?',
    okLabel: 'Cerrar sesión'
  });

  if (!confirmado) return;

  auth.logout();
  notificar('Sesión cerrada correctamente', 'positive');
  router.push({ name: 'catalogo' });
}
</script>

<style scoped>
.route-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 6000;
  background: linear-gradient(90deg, var(--green), var(--green-soft));
  transform: scaleX(0);
  transform-origin: left;
  opacity: 0;
  pointer-events: none;
}

.route-bar--activa { animation: route-run 0.55s var(--ease-out); }

.app-header {
  background: linear-gradient(115deg, var(--green-dark) 0%, var(--green) 55%, #1cae57 100%);
  background-size: 200% 200%;
  animation: gradient-pan 14s ease infinite;
  box-shadow: 0 8px 24px rgba(13, 107, 53, 0.16);
  overflow: hidden;
}

.app-header::before,
.app-header::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.app-header::before {
  width: 260px;
  height: 260px;
  top: -150px;
  right: 8%;
  animation: float-slow 11s ease-in-out infinite;
}

.app-header::after {
  width: 160px;
  height: 160px;
  bottom: -110px;
  left: 30%;
  animation: float-slow 9s ease-in-out infinite reverse;
}

.app-toolbar { position: relative; z-index: 1; min-height: 72px; }

.brand-mark { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; letter-spacing: 0; }
.brand-mark b { color: var(--green-soft); }

.brand-mark__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ffffff;
  color: var(--green-dark);
  box-shadow: 0 6px 18px rgba(18, 60, 42, 0.25);
}

.user-chip { max-width: 240px; font-weight: 600; }
.user-chip .q-chip__content { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.app-login-btn { transition: transform 0.25s var(--ease-spring), box-shadow 0.25s ease; }
.app-login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18); }

.app-drawer { background: #fbfefc !important; }
.drawer-kicker { color: var(--muted); font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }

.nav-item {
  min-height: 48px;
  margin: 4px 10px;
  border-radius: 10px;
  color: var(--muted);
  transition: transform 0.25s var(--ease-spring), background 0.25s ease, color 0.25s ease;
}

.nav-item .q-icon { color: var(--green); transition: transform 0.25s var(--ease-spring); }
.nav-item:hover { transform: translateX(6px); background: var(--wash-strong); color: var(--green-dark); }
.nav-item:hover .q-icon { transform: scale(1.15) rotate(-6deg); }

.nav-item--active { background: var(--wash-strong); color: var(--green-dark); font-weight: 700; }
.nav-item--active .q-icon { color: var(--green-dark); animation: icon-bounce 0.6s var(--ease-spring); }

@media (max-width: 599px) {
  .app-toolbar { padding: 0 14px; }
  .user-chip { display: none; }
}
</style>
