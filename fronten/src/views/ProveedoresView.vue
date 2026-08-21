<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-primary text-bold">Proveedores</div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo proveedor"
        no-caps
        @click="abrirCrear"
      />
    </div>

    <q-table
      :rows="proveedores"
      :columns="columns"
      row-key="_id"
      :loading="loading"
      :pagination="pagination"
      :rows-per-page-options="[5, 10, 20, 50]"
      @request="cargarProveedores"
    >
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
            color="negative"
            icon="delete"
            @click="eliminar(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogo">
      <q-card style="min-width: 480px">
        <q-card-section>
          <div class="text-h6 text-primary">
            {{ esEdicion ? 'Editar proveedor' : 'Nuevo proveedor' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="formRef" class="q-gutter-md" @submit.prevent="guardar">
            <q-input
              v-model="formulario.nombre"
              label="Nombre"
              outlined
              dense
              color="primary"
              lazy-rules
              :rules="[required('El nombre es requerido')]"
              :disable="guardando"
            />
            <q-input
              v-model="formulario.slug"
              label="Slug"
              outlined
              dense
              color="primary"
              lazy-rules
              hint="Identificador en minúsculas, ej: proveedor-ejemplo"
              :rules="[required('El slug es requerido')]"
              :disable="guardando"
            />
            <q-input
              v-model="formulario.contactoEmail"
              label="Email de contacto"
              type="email"
              outlined
              dense
              color="primary"
              lazy-rules
              :rules="[validEmail('Ingresa un email válido')]"
              :disable="guardando"
            />
            <q-input
              v-model="formulario.logoUrl"
              label="URL del logo"
              outlined
              dense
              color="primary"
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
import { ref, reactive } from 'vue';
import api from '../services/api';
import { useFeedback } from '../composables/useFeedback';
import { useDate } from '../composables/useDate';
import { required, validEmail } from '../utils/validators';

const { confirmar, notificar } = useFeedback();
const { formatDate } = useDate();

const proveedores = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'contactoEmail', label: 'Email', field: 'contactoEmail', align: 'left' },
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
  nombre: '',
  slug: '',
  contactoEmail: '',
  logoUrl: '',
  activo: true
});

async function cargarProveedores(props) {
  const { page, rowsPerPage } = props.pagination;
  loading.value = true;

  try {
    const res = await api.proveedores.list({ page, limit: rowsPerPage });
    proveedores.value = res.data;
    pagination.value = {
      ...pagination.value,
      page: res.page,
      rowsPerPage: res.limit,
      rowsNumber: res.total
    };
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar los proveedores',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}

function recargar() {
  cargarProveedores({ pagination: pagination.value });
}

function abrirCrear() {
  esEdicion.value = false;
  idEdicion.value = null;
  Object.assign(formulario, {
    nombre: '',
    slug: '',
    contactoEmail: '',
    logoUrl: '',
    activo: true
  });
  dialogo.value = true;
}

function abrirEditar(proveedor) {
  esEdicion.value = true;
  idEdicion.value = proveedor._id;
  Object.assign(formulario, {
    nombre: proveedor.nombre,
    slug: proveedor.slug,
    contactoEmail: proveedor.contactoEmail || '',
    logoUrl: proveedor.logoUrl || '',
    activo: proveedor.activo
  });
  dialogo.value = true;
}

async function guardar() {
  const valido = await formRef.value.validate();
  if (!valido) return;

  guardando.value = true;

  try {
    if (esEdicion.value) {
      await api.proveedores.update(idEdicion.value, { ...formulario });
      notificar('Proveedor actualizado correctamente', 'positive');
    } else {
      await api.proveedores.create({ ...formulario });
      notificar('Proveedor creado correctamente', 'positive');
    }
    dialogo.value = false;
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo guardar el proveedor',
      'negative'
    );
  } finally {
    guardando.value = false;
  }
}

async function eliminar(proveedor) {
  const confirmado = await confirmar({
    title: 'Eliminar proveedor',
    message: `¿Seguro que quieres eliminar el proveedor "${proveedor.nombre}"?`,
    okLabel: 'Eliminar',
    okColor: 'negative'
  });

  if (!confirmado) return;

  try {
    await api.proveedores.remove(proveedor._id);
    notificar('Proveedor eliminado correctamente', 'positive');
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo eliminar el proveedor',
      'negative'
    );
  }
}
</script>
