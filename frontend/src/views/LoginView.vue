<template>
  <div class="login row items-center justify-center q-pa-md">
    <div class="login__blob login__blob--1"></div>
    <div class="login__blob login__blob--2"></div>
    <div class="login__blob login__blob--3"></div>

    <q-card class="login__card" flat bordered>
      <q-card-section class="text-center q-pt-xl">
        <div class="login__icon">
          <q-icon name="inventory_2" />
        </div>
        <div class="text-h5 texto-degradado text-bold q-mt-md">Catálogo Bulk</div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">Acceso exclusivo para administradores</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-y-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            autocomplete="username"
            outlined
            dense
            color="primary"
            lazy-rules
            :rules="[required('El email es requerido'), validEmail('Ingresa un email válido')]"
            :disable="loading"
          >
            <template #prepend><q-icon name="mail" /></template>
          </q-input>

          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            autocomplete="current-password"
            outlined
            dense
            color="primary"
            lazy-rules
            :rules="[required('La contraseña es requerida')]"
            :disable="loading"
          >
            <template #prepend><q-icon name="lock" /></template>
          </q-input>

          <div>
            <q-btn
              type="submit"
              color="primary"
              icon="login"
              label="Ingresar"
              class="full-width login__btn"
              no-caps
              unelevated
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          icon="arrow_back"
          label="Volver al catálogo"
          :to="{ name: 'catalogo' }"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';
import { useFeedback } from '../composables/useFeedback';
// 👇 Agrega esta línea para importar las validaciones
import { required, validEmail } from '../utils/validators';

const router = useRouter();
const auth = useAppStore();
const { notificar } = useFeedback();

const email = ref('');
const password = ref('');
const loading = ref(false);

async function onSubmit() {
  loading.value = true;

  try {
    const usuario = await auth.login(email.value, password.value);
    notificar(`Bienvenido, ${usuario.email}`, 'positive');
    router.push({ name: auth.isAdmin ? 'home' : 'catalogo' });
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo iniciar sesión. Intenta de nuevo.',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login {
  position: relative;
  min-height: 100vh;
  background: var(--wash);
  overflow: hidden;
}

.login__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  pointer-events: none;
}

.login__blob--1 { width: 420px; height: 420px; top: -120px; left: -100px; background: rgba(21, 148, 71, 0.18); animation: float-slow 12s ease-in-out infinite; }
.login__blob--2 { width: 380px; height: 380px; bottom: -140px; right: -80px; background: rgba(13, 107, 53, 0.14); animation: float-slow 14s ease-in-out infinite reverse; }
.login__blob--3 { width: 220px; height: 220px; top: 42%; right: 18%; background: rgba(185, 237, 199, 0.55); animation: float-slow 10s ease-in-out infinite 1.5s; }

.login__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: var(--shadow-lg);
  animation: pop 0.6s var(--ease-spring) both;
}

.login__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 20px;
  background: var(--wash-strong);
  color: var(--green-dark);
  font-size: 2rem;
  box-shadow: 0 10px 24px rgba(21, 148, 71, 0.18);
}

.login__btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s ease;
}

.login__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(21, 148, 71, 0.3);
}
</style>