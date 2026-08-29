<template>
  <q-page class="q-pa-md">
    <header class="admin-head entrada">
      <div>
        <div class="kicker">Gestión</div>
        <h1 class="texto-degradado">Categorías</h1>
      </div>
      <q-btn
        v-if="auth.isAdmin"
        color="primary"
        icon="add"
        label="Nueva categoría"
        no-caps
        class="btn-glow"
        @click="abrirCrear"
      />
    </header>

    <q-card flat bordered class="admin-panel entrada" style="animation-delay: 100ms">
      <q-card-section class="q-pa-none">
        <q-table
          flat
          :rows="categorias"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[5, 10, 20, 0]"
        >
          <template #body-cell-activa="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activa ? 'primary' : 'grey-4'"
                :text-color="props.row.activa ? 'white' : 'grey-7'"
              >
                {{ props.row.activa ? 'Activa' : 'Inactiva' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn
                v-if="auth.isAdmin"
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="abrirEditar(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
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
            {{ esEdicion ? 'Editar categoría' : 'Nueva categoría' }}
          </div>
        </q-card-section>

        <q-card-section class="form-dialog__body">
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="guardar">
            <q-input
              v-model="formulario.nombre"
              label="Nombre"
              outlined
              dense
              color="primary"
              lazy-rules
              hint="El slug se genera automáticamente"
              :rules="[required('El nombre es requerido')]"
              :disable="guardando"
            />
            <q-input
              v-model="formulario.descripcion"
              label="Descripción"
              type="textarea"
              outlined
              dense
              color="primary"
              :disable="guardando"
            />
            <q-toggle
              v-model="formulario.activa"
              label="Activa"
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
import { required } from '../utils/validators';

const auth = useAppStore();
const { notificar } = useFeedback();
const { formatDate } = useDate();

const categorias = ref([]);
const loading = ref(false);
const pagination = ref({ rowsPerPage: 10 });

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activa', label: 'Estado', field: 'activa', align: 'center' },
  { name: 'createdAt', label: 'Creada', field: 'createdAt', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
];

const dialogo = ref(false);
const esEdicion = ref(false);
const idEdicion = ref(null);
const guardando = ref(false);
const formRef = ref(null);
const formulario = reactive({
  nombre: '',
  descripcion: '',
  activa: true
});

async function cargar() {
  loading.value = true;
  try {
    categorias.value = await api.categorias.list();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar las categorías',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}

function abrirCrear() {
  esEdicion.value = false;
  idEdicion.value = null;
  Object.assign(formulario, { nombre: '', descripcion: '', activa: true });
  dialogo.value = true;
}

function abrirEditar(categoria) {
  esEdicion.value = true;
  idEdicion.value = categoria._id;
  Object.assign(formulario, {
    nombre: categoria.nombre,
    descripcion: categoria.descripcion || '',
    activa: categoria.activa
  });
  dialogo.value = true;
}

async function guardar() {
  const valido = await formRef.value.validate();
  if (!valido) return;

  guardando.value = true;

  try {
    if (esEdicion.value) {
      await api.categorias.update(idEdicion.value, { ...formulario });
      notificar('Categoría actualizada correctamente', 'positive');
    } else {
      await api.categorias.create({ ...formulario });
      notificar('Categoría creada correctamente', 'positive');
    }
    dialogo.value = false;
    cargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo guardar la categoría',
      'negative'
    );
  } finally {
    guardando.value = false;
  }
}

onMounted(cargar);
</script>
