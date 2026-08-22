<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menú"
          @click="drawer = !drawer"
        />

        <q-toolbar-title>Catálogo Bulk</q-toolbar-title>

        <q-chip
          v-if="auth.isAuthenticated"
          icon="account_circle"
          color="white"
          text-color="primary"
          class="q-mr-sm"
        >
          {{ auth.usuario?.email }}
        </q-chip>

        <q-btn flat icon="logout" label="Salir" no-caps @click="onLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="240" bordered class="bg-white">
      <q-list>
        <q-item-label header class="text-primary text-bold">Menú</q-item-label>

        <q-item :to="{ name: 'home' }" exact active-class="text-primary text-bold" clickable>
          <q-item-section avatar>
            <q-icon name="home" color="primary" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item :to="{ name: 'proveedores' }" active-class="text-primary text-bold" clickable>
          <q-item-section avatar>
            <q-icon name="local_shipping" color="primary" />
          </q-item-section>
          <q-item-section>Proveedores</q-item-section>
        </q-item>

        <q-item :to="{ name: 'categorias' }" active-class="text-primary text-bold" clickable>
          <q-item-section avatar>
            <q-icon name="category" color="primary" />
          </q-item-section>
          <q-item-section>Categorías</q-item-section>
        </q-item>

        <q-item :to="{ name: 'productos' }" active-class="text-primary text-bold" clickable>
          <q-item-section avatar>
            <q-icon name="inventory_2" color="primary" />
          </q-item-section>
          <q-item-section>Productos</q-item-section>
        </q-item>

        <q-item
          v-if="auth.isAdmin"
          :to="{ name: 'usuarios' }"
          active-class="text-primary text-bold"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="people" color="primary" />
          </q-item-section>
          <q-item-section>Usuarios</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';
import { useFeedback } from '../composables/useFeedback';

const drawer = ref(false);
const router = useRouter();
const auth = useAppStore();
const { confirmar, notificar } = useFeedback();

async function onLogout() {
  const confirmado = await confirmar({
    title: 'Cerrar sesión',
    message: '¿Seguro que quieres cerrar la sesión?',
    okLabel: 'Cerrar sesión'
  });

  if (!confirmado) return;

  auth.logout();
  notificar('Sesión cerrada correctamente', 'positive');
  router.push({ name: 'login' });
}
</script>
