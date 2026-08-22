<template>
  <div class="catalogo q-pa-md">
    <div class="text-h5 text-primary text-bold q-mb-md">Catálogo</div>

    <q-input
      v-model="filtros.q"
      debounce="400"
      outlined
      dense
      color="primary"
      clearable
      placeholder="Buscar producto por nombre…"
      class="q-mb-md"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered>
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-primary text-bold">Categorías</div>
          </q-card-section>
          <q-list>
            <q-item
              clickable
              :active="filtros.categoria === null"
              active-class="text-primary text-bold"
              @click="filtros.categoria = null"
            >
              <q-item-section>Todas</q-item-section>
            </q-item>
            <q-item
              v-for="c in categorias"
              :key="c._id"
              clickable
              :active="filtros.categoria === c.nombre"
              active-class="text-primary text-bold"
              @click="filtros.categoria = c.nombre"
            >
              <q-item-section>{{ c.nombre }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-primary text-bold q-mb-sm">Proveedor</div>
            <q-select
              v-model="filtros.proveedor"
              :options="proveedores"
              option-value="_id"
              option-label="nombre"
              emit-value
              clearable
              outlined
              dense
              color="primary"
              label="Todos los proveedores"
            />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-9">
        <div v-if="loading && productos.length === 0" class="q-pa-lg text-center">
          <q-spinner color="primary" size="2rem" />
        </div>

        <div v-else-if="productos.length === 0" class="q-pa-lg text-center text-grey-7">
          No hay productos que coincidan con los filtros.
        </div>

        <div v-else>
          <div class="productos-grid">
            <q-card
              v-for="producto in productos"
              :key="producto._id"
              class="producto-card"
              flat
              bordered
            >
              <q-img
                v-if="producto.imagenUrl"
                :src="producto.imagenUrl"
                :ratio="1"
              />
              <div v-else class="producto-card__placeholder">
                <q-icon name="image" color="primary" size="48px" />
              </div>

              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ producto.nombre }}</div>
                <div class="text-caption text-grey-7 text-uppercase">
                  {{ producto.categoria }}
                </div>
                <div class="text-h6 text-primary q-mt-sm">
                  {{ formatCurrency(producto.precio) }}
                </div>

                <div class="row items-center justify-between q-mt-sm">
                  <q-badge
                    :color="producto.disponible ? 'primary' : 'grey-4'"
                    :text-color="producto.disponible ? 'white' : 'grey-7'"
                  >
                    {{ producto.disponible ? 'Disponible' : 'Sin stock' }}
                  </q-badge>
                  <span class="text-caption text-grey-7">
                    {{ nombreProveedor(producto.proveedorId) }}
                  </span>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="q-mt-md text-center">
            <q-btn
              v-if="hayMas"
              color="primary"
              outline
              label="Cargar más"
              no-caps
              :loading="loading"
              @click="cargarMas"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import api from '../services/api';
import { useFeedback } from '../composables/useFeedback';
import { formatCurrency } from '../utils/format';

const { notificar } = useFeedback();

const LIMIT = 12;

const productos = ref([]);
const proveedores = ref([]);
const categorias = ref([]);
const page = ref(1);
const total = ref(0);
const loading = ref(false);

const filtros = reactive({
  q: '',
  categoria: null,
  proveedor: null
});

const hayMas = () => productos.value.length < total.value;

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
      err.response?.data?.error || 'No se pudieron cargar los filtros',
      'negative'
    );
  }
}

async function cargarProductos(reset = false) {
  if (reset) {
    page.value = 1;
    productos.value = [];
  }

  loading.value = true;

  try {
    const params = { page: page.value, limit: LIMIT };
    if (filtros.q) params.q = filtros.q;
    if (filtros.categoria) params.categoria = filtros.categoria;
    if (filtros.proveedor) params.proveedor = filtros.proveedor;

    const res = await api.productos.list(params);

    if (reset) {
      productos.value = res.data;
    } else {
      productos.value = [...productos.value, ...res.data];
    }
    total.value = res.total;
  } catch (err) {
    notificar(
      err.response?.data?.error || 'No se pudieron cargar los productos',
      'negative'
    );
  } finally {
    loading.value = false;
  }
}

async function cargarMas() {
  page.value += 1;
  await cargarProductos(false);
}

function nombreProveedor(id) {
  return proveedores.value.find((p) => p._id === id)?.nombre || id;
}

watch(
  () => filtros.q,
  () => cargarProductos(true)
);
watch(
  () => filtros.categoria,
  () => cargarProductos(true)
);
watch(
  () => filtros.proveedor,
  () => cargarProductos(true)
);

onMounted(() => {
  cargarOpciones();
  cargarProductos(true);
});
</script>

<style scoped>
.catalogo {
  min-height: 100vh;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.producto-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.producto-card:hover {
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.15);
  transform: translateY(-2px);
}

.producto-card__placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f5e9;
}
</style>
