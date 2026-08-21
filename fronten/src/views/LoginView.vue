<template>
  <div class="login row items-center justify-center q-pa-md">
    <q-card class="login__card" flat bordered>
      <q-card-section class="text-center">
        <q-icon name="inventory_2" color="primary" size="48px" />
        <div class="text-h5 text-primary text-bold q-mt-sm">Catálogo Bulk</div>
        <div class="text-subtitle2 text-grey-7">Inicia sesión para continuar</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
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

          <q-btn
            type="submit"
            color="primary"
            icon="login"
            label="Ingresar"
            class="full-width"
            no-caps
            :loading="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../store';
import { useFeedback } from '../composables/useFeedback';
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
    router.push({ name: 'home' });
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
  min-height: 100vh;
  background: #ffffff;
}

.login__card {
  width: 100%;
  max-width: 400px;
}
</style>
