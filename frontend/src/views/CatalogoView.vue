<template>
  <q-page class="catalogo q-pa-lg">
    <div class="buscador entrada">
      <span class="buscador__lupa">
        <q-icon name="search" />
      </span>
      <q-input
        v-model="filtros.q"
        debounce="400"
        borderless
        color="primary"
        clearable
        placeholder="¿Qué producto estás buscando?"
        class="buscador__input"
      />
    </div>

    <div class="categorias-scroll entrada" style="animation-delay: 80ms">
      <button
        type="button"
        class="cat-chip"
        :class="{ 'cat-chip--activa': filtros.categoria === null }"
        @click="filtros.categoria = null"
      >
        Todas
      </button>
      <button
        v-for="c in categorias"
        :key="c._id"
        type="button"
        class="cat-chip"
        :class="{ 'cat-chip--activa': filtros.categoria === c.nombre }"
        @click="filtros.categoria = c.nombre"
      >
        {{ c.nombre }}
      </button>
    </div>

    <div class="filtro-proveedor entrada" style="animation-delay: 120ms">
      <q-select
        v-model="filtros.proveedor"
        :options="opcionesProveedores"
        map-options
        emit-value
        clearable
        outlined
        dense
        color="primary"
        label="Todos los proveedores"
        class="filtro-proveedor__select"
      >
        <template #prepend>
          <q-icon name="local_shipping" class="filtro-proveedor__icon" />
        </template>
      </q-select>
    </div>

    <div v-if="loading && productos.length === 0" class="productos-grid q-mt-lg">
      <div v-for="n in 8" :key="n" class="skeleton" style="height: 320px; border-radius: 18px"></div>
    </div>

    <div v-else-if="productos.length === 0" class="catalogo__vacio entrada q-mt-lg">
      <div class="catalogo__vacio-icon"><q-icon name="search_off" /></div>
      <div class="text-subtitle1 text-weight-bold">No hay productos que coincidan con los filtros.</div>
      <div class="text-caption text-grey-6 q-mt-xs">Prueba con otra búsqueda o quita los filtros.</div>
    </div>

    <div v-else>
      <div class="productos-grid q-mt-lg">
        <q-card
          v-for="(producto, idx) in productos"
          :key="producto._id"
          class="producto-card"
          flat
          bordered
          :style="{ '--i': idx }"
        >
          <div class="producto-card__media">
            <q-img
              v-if="producto.imagenUrl"
              :src="producto.imagenUrl"
              :ratio="1"
              fit="cover"
              class="producto-card__img"
            />
            <div v-else class="producto-card__placeholder">
              <q-icon name="image" color="primary" size="48px" />
            </div>
            <span class="producto-card__etiqueta">{{ producto.categoria }}</span>
          </div>

          <q-card-section>
            <div class="text-subtitle1 text-weight-bold producto-card__nombre">
              {{ producto.nombre }}
            </div>
            <div class="text-h6 texto-degradado producto-card__precio q-mt-xs">
              {{ formatCurrency(producto.precio) }}
            </div>

            <div class="row items-center justify-between q-mt-sm producto-card__footer">
              <q-badge
                :color="producto.disponible ? 'primary' : 'grey-4'"
                :text-color="producto.disponible ? 'white' : 'grey-7'"
                class="producto-card__badge"
              >
                <span class="punto" :class="producto.disponible ? 'punto--on' : 'punto--off'" />
                {{ producto.disponible ? 'Disponible' : 'Sin stock' }}
              </q-badge>
              <span
                class="text-caption text-grey-7 producto-card__proveedor"
                :title="nombreProveedor(producto.proveedorId)"
              >
                {{ nombreProveedor(producto.proveedorId) }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="hayMas" class="q-mt-lg text-center entrada">
        <q-btn
          color="primary"
          outline
          rounded
          icon="expand_more"
          label="Cargar más"
          no-caps
          class="btn-glow"
          :loading="loading"
          @click="cargarMas"
        />
      </div>
    </div>

    <Teleport to="body">
      <q-btn
        round
        color="primary"
        icon="arrow_upward"
        aria-label="Volver arriba"
        class="scroll-top-btn"
        :class="{ 'scroll-top-btn--visible': mostrarSubir }"
        @click="subirArriba"
      />
    </Teleport>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import { useFeedback } from '../composables/useFeedback';
import { formatCurrency } from '../utils/format';

const { notificar } = useFeedback();

const LIMIT = 25;

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

const hayMas = computed(() => productos.value.length < total.value);

const mostrarSubir = ref(false);

function actualizarBotonSubir() {
  mostrarSubir.value = window.scrollY > 80;
}

function subirArriba() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const proveedoresActivos = computed(() =>
  proveedores.value.filter((p) => p.activo)
);

const opcionesProveedores = computed(() =>
  proveedoresActivos.value.map((p) => ({ label: p.nombre, value: p._id }))
);

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
  window.addEventListener('scroll', actualizarBotonSubir, { passive: true });
  actualizarBotonSubir();
});

onUnmounted(() => {
  window.removeEventListener('scroll', actualizarBotonSubir);
});
</script>

<style scoped>
.catalogo { 
  max-width: 1320px; 
  margin: 0 auto; 
}

.buscador {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 20px 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(18, 60, 42, 0.06);
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s var(--ease-spring);
}
.buscador:focus-within {
  border-color: var(--green-soft);
  box-shadow: 0 14px 40px rgba(21, 148, 71, 0.16);
  transform: translateY(-2px);
}
.buscador__lupa {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #ffffff;
  font-size: 1.35rem;
  box-shadow: 0 8px 20px rgba(21, 148, 71, 0.35);
  transition: transform 0.3s var(--ease-spring);
}
.buscador:focus-within .buscador__lupa { transform: scale(1.08) rotate(-6deg); }
.buscador__input { flex: 1 1 auto; }

.categorias-scroll {
  display: flex;
  gap: 10px;
  margin: 18px 0 16px;
  padding: 4px 2px 10px;
  overflow-x: auto;
  scrollbar-width: none;
}
.categorias-scroll::-webkit-scrollbar { display: none; }

.cat-chip {
  flex: 0 0 auto;
  padding: 9px 20px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #ffffff;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.25s var(--ease-spring), background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.cat-chip:hover {
  color: var(--green-dark);
  border-color: var(--green-soft);
  transform: translateY(-2px);
}
.cat-chip--activa {
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 8px 20px rgba(21, 148, 71, 0.28);
}

.filtro-proveedor { margin-bottom: 4px; }
.filtro-proveedor__select { max-width: 300px; }
.filtro-proveedor__icon { color: var(--green); transition: transform 0.3s var(--ease-spring); }
.filtro-proveedor__select :deep(.q-field__control) {
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(18, 60, 42, 0.06);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.filtro-proveedor__select:hover :deep(.q-field__control) {
  border-color: var(--green-soft);
}
.filtro-proveedor__select.q-field--focused :deep(.q-field__control) {
  border-color: var(--green-soft);
  box-shadow: 0 10px 26px rgba(21, 148, 71, 0.16);
}
.filtro-proveedor__select.q-field--focused .filtro-proveedor__icon {
  transform: scale(1.15) rotate(-8deg);
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.producto-card {
  overflow: hidden;
  border-radius: 18px;
  animation: pop 0.65s var(--ease-spring) both;
  animation-delay: calc(var(--i) * 70ms);
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s ease, border-color 0.3s ease;
}

.producto-card:hover {
  transform: translateY(-8px);
  border-color: var(--green-soft);
  box-shadow: 0 18px 40px rgba(18, 60, 42, 0.18);
}

.producto-card__media { position: relative; overflow: hidden; }
.producto-card__img { transition: transform 0.55s var(--ease-out); }
.producto-card:hover .producto-card__img { transform: scale(1.08); }

.producto-card__media::after {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: skewX(-20deg);
  transition: left 0.65s var(--ease-out);
}

.producto-card:hover .producto-card__media::after { left: 130%; }

.producto-card__placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wash-strong);
}

.producto-card__etiqueta {
  position: absolute;
  top: 10px;
  left: 10px;
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--green-dark);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  backdrop-filter: blur(4px);
}

.producto-card__nombre {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.producto-card:hover .producto-card__nombre { color: var(--green-dark); }
.producto-card__precio { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.producto-card__footer { gap: 8px; }
.producto-card__badge { display: inline-flex; flex-shrink: 0; }
.producto-card__proveedor {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.punto {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.punto--on { background: #ffffff; animation: blink 1.6s ease infinite; }
.punto--off { background: #b0bec5; }

.scroll-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 5000;
  opacity: 0;
  pointer-events: none;
  transform: translateY(20px);
  box-shadow: 0 10px 24px rgba(18, 60, 42, 0.28);
  transition: opacity 0.3s ease, transform 0.3s var(--ease-spring), box-shadow 0.25s ease;
}
.scroll-top-btn--visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.scroll-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(18, 60, 42, 0.34);
}

.catalogo__vacio { padding: 64px 20px; text-align: center; border: 1px dashed var(--line); border-radius: 20px; background: #ffffff; }
.catalogo__vacio-icon { display: grid; place-items: center; width: 84px; height: 84px; margin: 0 auto 16px; border-radius: 26px; background: var(--wash-strong); color: var(--green); font-size: 2.4rem; animation: float 4.5s ease-in-out infinite; }

/* Media queries ajustados */
@media (max-width: 767px) {
  .buscador { padding: 6px 14px 6px 6px; gap: 10px; }
  .buscador__lupa { width: 40px; height: 40px; font-size: 1.15rem; }
  .filtro-proveedor__select { max-width: 100%; }

  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>