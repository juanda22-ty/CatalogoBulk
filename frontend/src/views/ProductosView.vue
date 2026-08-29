<template>
  <q-page class="q-pa-md">
    <header class="admin-head entrada">
      <div>
        <div class="kicker">Gestión</div>
        <h1 class="texto-degradado">Productos</h1>
      </div>
      <q-btn v-if="auth.isAdmin" color="primary" icon="add" label="Nuevo producto" no-caps class="btn-glow"
        @click="abrirCrear" />
    </header>

    <q-card flat bordered class="admin-panel entrada" style="animation-delay: 100ms">
      <q-card-section class="q-pa-none">
        <q-table ref="tablaRef" flat :rows="productos" :columns="columns" row-key="_id" :loading="loading" :pagination="pagination"
          :rows-per-page-options="[5, 10, 20, 50]" @request="cargarProductos">
          <template #body-cell-precio="props">
            <q-td :props="props">
              <span class="celda-precio">{{ formatCurrency(props.row.precio) }}</span>
            </q-td>
          </template>

          <template #body-cell-disponible="props">
            <q-td :props="props">
              <q-badge :color="props.row.disponible ? 'primary' : 'grey-4'"
                :text-color="props.row.disponible ? 'white' : 'grey-7'">
                {{ props.row.disponible ? 'Disponible' : 'Sin stock' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-proveedorId="props">
            <q-td :props="props">
              {{ nombreProveedor(props.row.proveedorId) }}
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props" class="q-gutter-xs text-right">
              <q-btn v-if="auth.isAdmin" flat round dense color="primary" icon="edit" @click="abrirEditar(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn v-if="auth.isAdmin" flat round dense color="negative" icon="delete" @click="eliminar(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
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
            {{ esEdicion ? 'Editar producto' : 'Nuevo producto' }}
          </div>
        </q-card-section>

        <q-card-section class="form-dialog__body">
          <q-form ref="formRef" class="q-gutter-y-md" @submit.prevent="guardar">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="formulario.sku" label="SKU" outlined dense color="primary" lazy-rules
                  :rules="[required('El SKU es requerido')]" :disable="guardando" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="formulario.nombre" label="Nombre" outlined dense color="primary" lazy-rules
                  :rules="[required('El nombre es requerido')]" :disable="guardando" />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="formulario.precio" label="Precio" type="number" outlined dense color="primary"
                  lazy-rules :rules="[required('El precio es requerido'), precioValido]" :disable="guardando" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="formulario.stock" label="Stock" type="number" outlined dense color="primary"
                  lazy-rules :rules="[stockValido]" :disable="guardando" />
              </div>
            </div>

            <q-select v-model="formulario.proveedorId" :options="proveedores" option-value="_id" option-label="nombre"
              emit-value label="Proveedor" outlined dense color="primary" lazy-rules
              :rules="[required('El proveedor es requerido')]" :disable="guardando" />

            <q-select v-model="formulario.categoria" :options="categorias" option-value="nombre" option-label="nombre"
              emit-value label="Categoría" outlined dense color="primary" lazy-rules
              :rules="[required('La categoría es requerida')]" :disable="guardando" />

            <q-input v-model="formulario.descripcion" label="Descripción" type="textarea" rows="3" outlined dense
              color="primary" :disable="guardando" />
            <q-input v-model="formulario.imagenUrl" label="URL de la imagen" outlined dense color="primary"
              :disable="guardando" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg q-pb-md">
          <q-btn flat label="Cancelar" no-caps color="primary" v-close-popup />
          <q-btn color="primary" :label="esEdicion ? 'Guardar' : 'Crear'" no-caps unelevated :loading="guardando"
            @click="guardar" />
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
import { formatCurrency } from '../utils/format';

const auth = useAppStore();
const { confirmar, notificar } = useFeedback();
const { formatDate } = useDate();

const tablaRef = ref(null);

const productos = ref([]);
const proveedores = ref([]);
const categorias = ref([]);
const loading = ref(false);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right' },
  { name: 'disponible', label: 'Estado', field: 'disponible', align: 'center' },
  { name: 'proveedorId', label: 'Proveedor', field: 'proveedorId', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
];

const dialogo = ref(false);
const esEdicion = ref(false);
const idEdicion = ref(null);
const guardando = ref(false);
const formRef = ref(null);
const formulario = reactive({
  sku: '',
  nombre: '',
  precio: 0,
  stock: 0,
  categoria: null,
  descripcion: '',
  imagenUrl: '',
  proveedorId: null
});

const precioValido = (v) =>
  (v !== '' && v !== null && Number(v) >= 0) || 'El precio debe ser mayor o igual a 0';

const stockValido = (v) =>
  v === '' ||
  v === null ||
  (Number.isInteger(Number(v)) && Number(v) >= 0) ||
  'El stock debe ser un entero mayor o igual a 0';

async function cargarProductos(props) {
  const { page, rowsPerPage } = props.pagination;
  loading.value = true;

  try {
    const res = await api.productos.list({ page, limit: rowsPerPage });
    productos.value = res.data;
    pagination.value = {
      ...pagination.value,
      page: res.page,
      rowsPerPage: res.limit,
      rowsNumber: res.total
    };
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar los productos',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}

async function cargarOpciones() {
  try {
    const [prov, cats] = await Promise.all([
      api.proveedores.list({ limit: 100 }),
      api.categorias.list()
    ]);
    proveedores.value = prov.data;
    categorias.value = cats;
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar proveedores y categorías',
      'negative'
    );
  }
}

function nombreProveedor(id) {
  return proveedores.value.find((p) => p._id === id)?.nombre || id;
}

function recargar() {
  cargarProductos({ pagination: pagination.value });
}

function abrirCrear() {
  esEdicion.value = false;
  idEdicion.value = null;
  Object.assign(formulario, {
    sku: '',
    nombre: '',
    precio: 0,
    stock: 0,
    categoria: null,
    descripcion: '',
    imagenUrl: '',
    proveedorId: null
  });
  dialogo.value = true;
}

function abrirEditar(producto) {
  esEdicion.value = true;
  idEdicion.value = producto._id;
  Object.assign(formulario, {
    sku: producto.sku,
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    categoria: producto.categoria,
    descripcion: producto.descripcion || '',
    imagenUrl: producto.imagenUrl || '',
    proveedorId: producto.proveedorId
  });
  dialogo.value = true;
}

function construirDatos() {
  return {
    ...formulario,
    precio: Number(formulario.precio),
    stock: Number(formulario.stock)
  };
}

async function guardar() {
  const valido = await formRef.value.validate();
  if (!valido) return;

  guardando.value = true;

  try {
    if (esEdicion.value) {
      await api.productos.update(idEdicion.value, construirDatos());
      notificar('Producto actualizado correctamente', 'positive');
    } else {
      await api.productos.create(construirDatos());
      notificar('Producto creado correctamente', 'positive');
    }
    dialogo.value = false;
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo guardar el producto',
      'negative'
    );
  } finally {
    guardando.value = false;
  }
}

async function eliminar(producto) {
  const confirmado = await confirmar({
    title: 'Eliminar producto',
    message: `¿Seguro que quieres eliminar el producto "${producto.nombre}"?`,
    okLabel: 'Eliminar',
    okColor: 'negative'
  });

  if (!confirmado) return;

  try {
    await api.productos.remove(producto._id);
    notificar('Producto eliminado correctamente', 'positive');
    recargar();
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudo eliminar el producto',
      'negative'
    );
  }
}

onMounted(() => {
  cargarOpciones();
  tablaRef.value?.requestServerInteraction();
});
</script>

<style scoped>
.celda-precio {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--green-dark);
}
</style>
