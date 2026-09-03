<template>
  <q-page class="q-pa-md">
    <header class="admin-head entrada">
      <div>
        <div class="kicker">Gestión</div>
        <h1 class="texto-degradado">Usuarios</h1>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo usuario"
        no-caps
        class="btn-glow"
        @click="abrirCrear"
      />
    </header>

    <q-card flat bordered class="admin-panel entrada" style="animation-delay: 100ms">
      <q-card-section class="q-pa-none">
        <q-table
          ref="tablaRef"
          flat
          :rows="usuarios"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[5, 10, 20, 50]"
          @request="cargarUsuarios"
        >
          <template #body-cell-rol="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.rol === 'admin' ? 'primary' : 'grey-4'"
                :text-color="props.row.rol === 'admin' ? 'white' : 'grey-7'"
                class="q-mr-xs"
              >
                <q-icon :name="props.row.rol === 'admin' ? 'admin_panel_settings' : 'person'" size="14px" class="q-mr-xs" />
                {{ props.row.rol }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-activo="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo ? 'primary' : 'grey-4'"
                :text-color="props.row.activo ? 'white' : 'grey-7'"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="q-gutter-xs text-right">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="abrirEditar(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :color="props.row.activo ? 'warning' : 'positive'"
                :icon="props.row.activo ? 'pause' : 'play_arrow'"
                @click="alternarActivo(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogo" transition-show="jump-down" transition-hide="jump-up">
      <q-card class="form-dialog">
        <q-card-section class="form-dialog__header row items-center no-wrap">
          <div class="dialogo-moderno__icon">
            <q-icon :name="esEdicion ? 'edit' : 'add'" />
          </div>
          <div class="text-h6 text-primary q-ml-sm form-dialog__title">
            {{ esEdicion ? 'Editar usuario' : 'Nuevo usuario' }}
          </div>
        </q-card-section>

        <q-card-section class="form-dialog__body">
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="guardar">
            <q-input
              v-model="formulario.email"
              label="Email"
              type="email"
              outlined
              dense
              color="primary"
              lazy-rules
              :rules="[required('El email es requerido'), validEmail('Ingresa un email válido')]"
              :disable="guardando"
            />

            <q-input
              v-model="formulario.password"
              :label="esEdicion ? 'Nueva contraseña' : 'Contraseña'"
              type="password"
              outlined
              dense
              color="primary"
              lazy-rules
              :hint="esEdicion ? 'Dejar en blanco para no cambiarla' : ''"
              :rules="esEdicion ? [] : [required('La contraseña es requerida')]"
              :disable="guardando"
            />

            <q-select
              v-model="formulario.rol"
              :options="roles"
              emit-value
              map-options
              label="Rol"
              outlined
              dense
              color="primary"
              lazy-rules
              :rules="[required('El rol es requerido')]"
              :disable="guardando"
            />

            <q-toggle
              v-model="formulario.activo"
              label="Activo"
              color="primary"
              :disable="guardando"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" no-caps color="primary" v-close-popup />
          <q-btn
            color="primary"
            :label="esEdicion ? 'Guardar' : 'Crear'"
            no-caps
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import { useAppStore } from '../store';
import { useFeedback } from '../composables/useFeedback';
import { useDate } from '../composables/useDate';
import { required, validEmail } from '../utils/validators';

const auth = useAppStore();
const { notificar } = useFeedback();
const { formatDate } = useDate();

const tablaRef = ref(null);

const usuarios = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Usuario', value: 'user' }
];

const columns = [
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'createdAt', label: 'Creado', field: 'createdAt', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
];

const dialogo = ref(false);
const esEdicion = ref(false);
const idEdicion = ref(null);
const guardando = ref(false);
const formRef = ref(null);
const formulario = reactive({
  email: '',
  password: '',
  rol: 'user',
  activo: true
});

async function cargarUsuarios(props) {
  const { page, rowsPerPage } = props.pagination;
  loading.value = true;

  try {
    const res = await api.usuarios.list({ page, limit: rowsPerPage });
    usuarios.value = res.data;
    pagination.value = {
      ...pagination.value,
      page: res.page,
      rowsPerPage: res.limit,
      rowsNumber: res.total
    };
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar los usuarios',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}

function recargar() {
  cargarUsuarios({ pagination: pagination.value });
}

function abrirCrear() {
  esEdicion.value = false;
  idEdicion.value = null;
  Object.assign(formulario, {
    email: '',
    password: '',
    rol: 'user',
    activo: true
  });
  dialogo.value = true;
}

function abrirEditar(usuario) {
  esEdicion.value = true;
  idEdicion.value = usuario._id;
  Object.assign(formulario, {
    email: usuario.email,
    password: '',
    rol: usuario.rol,
    activo: usuario.activo
  });
  dialogo.value = true;
}

function construirDatos() {
  const datos = {
    email: formulario.email,
    rol: formulario.rol,
    activo: formulario.activo
  };
  if (formulario.password) {
    datos.password = formulario.password;
  }
  return datos;
}

async function guardar() {
  const valido = await formRef.value.validate();
  if (!valido) return;

  guardando.value = true;

  try {
    if (esEdicion.value) {
      await api.usuarios.update(idEdicion.value, construirDatos());
      notificar('Usuario actualizado correctamente', 'positive');
    } else {
      await api.usuarios.create({ ...formulario });
      notificar('Usuario creado correctamente', 'positive');
    }
    dialogo.value = false;
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo guardar el usuario',
      'negative'
    );
  } finally {
    guardando.value = false;
  }
}

async function alternarActivo(usuario) {
  try {
    await api.usuarios.update(usuario._id, { activo: !usuario.activo });
    notificar(
      usuario.activo
        ? 'Usuario desactivado correctamente'
        : 'Usuario activado correctamente',
      'positive'
    );
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo cambiar el estado del usuario',
      'negative'
    );
  }
}

onMounted(() => {
  tablaRef.value?.requestServerInteraction();
});
</script>
