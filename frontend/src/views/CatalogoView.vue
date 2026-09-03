<template>
  <q-page class="catalogo q-pa-lg">
    <header class="catalogo__hero entrada">
      <div class="catalogo__hero-inner">
        <div class="kicker">Catálogo oficial</div>
        <h1 class="catalogo__titulo texto-degradado">Nuestro catálogo</h1>
        <p class="catalogo__subtitulo">
          Explora productos, compara precios y encuentra lo que buscas en segundos.
        </p>
      </div>
      <div class="catalogo__hero-deco">
        <q-icon name="inventory_2" class="deco-icon deco-icon--1" />
        <q-icon name="local_shipping" class="deco-icon deco-icon--2" />
        <q-icon name="sell" class="deco-icon deco-icon--3" />
      </div>
    </header>

    <div class="buscador entrada" style="animation-delay: 80ms">
      <q-input
        v-model="filtros.q"
        debounce="400"
        outlined
        color="primary"
        clearable
        placeholder="Buscar producto por nombre…"
        class="buscador__input"
      >
        <template #prepend>
          <span class="buscador__icon"><q-icon name="search" /></span>
        </template>
      </q-input>
    </div>

    <div class="row q-col-gutter-md">
      <aside class="col-12 col-md-3 catalogo__aside">
        <q-card flat bordered class="catalogo__filtro entrada" style="animation-delay: 120ms">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-primary text-bold">Categorías</div>
          </q-card-section>
          <q-list>
            <q-item
              clickable
              class="cat-item"
              :active="filtros.categoria === null"
              active-class="cat-item--activa"
              @click="filtros.categoria = null"
            >
              <q-item-section avatar><span class="cat-item__dot" /></q-item-section>
              <q-item-section>Todas</q-item-section>
              <q-item-section side>
                <q-icon
                  :class="filtros.categoria === null ? '' : 'invisible'"
                  name="check_circle"
                  color="primary"
                />
              </q-item-section>
            </q-item>
            <q-item
              v-for="c in categorias"
              :key="c._id"
              clickable
              class="cat-item"
              :active="filtros.categoria === c.nombre"
              active-class="cat-item--activa"
              @click="filtros.categoria = c.nombre"
            >
              <q-item-section avatar><span class="cat-item__dot" /></q-item-section>
              <q-item-section>{{ c.nombre }}</q-item-section>
              <q-item-section side>
                <q-icon
                  :class="filtros.categoria === c.nombre ? '' : 'invisible'"
                  name="check_circle"
                  color="primary"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card flat bordered class="catalogo__filtro q-mt-md entrada" style="animation-delay: 160ms">
          <q-card-section>
            <div class="text-subtitle1 text-primary text-bold q-mb-sm">Proveedor</div>
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
            />
          </q-card-section>
        </q-card>
      </aside>

      <div class="col-12 col-md-9">
        <div v-if="loading && productos.length === 0" class="productos-grid">
          <div v-for="n in 8" :key="n" class="skeleton" style="height: 320px; border-radius: 18px"></div>
        </div>

        <div v-else-if="productos.length === 0" class="catalogo__vacio entrada">
          <div class="catalogo__vacio-icon"><q-icon name="search_off" /></div>
          <div class="text-subtitle1 text-weight-bold">No hay productos que coincidan con los filtros.</div>
          <div class="text-caption text-grey-6 q-mt-xs">Prueba con otra búsqueda o quita los filtros.</div>
        </div>

        <div v-else>
          <div class="productos-grid">
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

          <div class="q-mt-lg text-center entrada">
            <q-btn
              v-if="hayMas"
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
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
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
});
</script>

<style scoped>
.catalogo { 
  max-width: 1320px; 
  margin: 0 auto; 
}

.catalogo__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  margin-bottom: 22px;
  padding: 34px 38px;
  border-radius: 24px;
  border: 1px solid var(--line);
  background: linear-gradient(115deg, var(--wash-strong) 0%, #ffffff 60%, var(--wash) 100%);
  background-size: 200% 200%;
  animation: gradient-pan 16s ease infinite;
}

.catalogo__hero-inner { position: relative; z-index: 1; }
.catalogo__titulo { margin: 8px 0 0; font-size: clamp(1.8rem, 3.4vw, 2.6rem); letter-spacing: 0; }
.catalogo__subtitulo { max-width: 420px; margin: 10px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.5; }

.deco-icon {
  position: absolute;
  color: rgba(21, 148, 71, 0.16);
  pointer-events: none;
}

.deco-icon--1 { top: -18px; right: 120px; font-size: 7rem; animation: float 7s ease-in-out infinite; }
.deco-icon--2 { bottom: -26px; right: 30px; font-size: 5.4rem; animation: float 9s ease-in-out infinite reverse; }
.deco-icon--3 { top: 20px; right: 330px; font-size: 2.6rem; animation: float 5.5s ease-in-out infinite 1.2s; }

.buscador { border-radius: 16px; transition: transform 0.3s var(--ease-spring); padding-bottom: 20px; }
.buscador:focus-within { transform: translateY(-2px); }
.buscador__icon { display: flex; align-items: center; color: var(--muted); transition: color 0.3s ease; }
.buscador:focus-within .buscador__icon { color: var(--green-dark); animation: icon-bounce 0.5s var(--ease-spring); }

/* Aside con z-index controlado para evitar superposiciones */
.catalogo__aside { 
  position: sticky; 
  top: 92px; 
  z-index: 2;
}

.catalogo__filtro { border-radius: 20px; }

.cat-item {
  border-radius: 10px;
  margin: 2px 8px;
  color: var(--muted);
  transition: transform 0.25s var(--ease-spring), background 0.25s ease, color 0.25s ease;
}

.cat-item:hover { transform: translateX(5px); background: var(--wash-strong); color: var(--green-dark); }
.cat-item__dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--line); transition: background 0.25s ease, transform 0.25s var(--ease-spring); }
.cat-item--activa { color: var(--green-dark); font-weight: 700; }
.cat-item--activa .cat-item__dot { background: var(--green); transform: scale(1.35); }
.cat-item .q-item__section--main { overflow: hidden; }
.cat-item .q-item__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

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

.catalogo__vacio { padding: 64px 20px; text-align: center; border: 1px dashed var(--line); border-radius: 20px; background: #ffffff; }
.catalogo__vacio-icon { display: grid; place-items: center; width: 84px; height: 84px; margin: 0 auto 16px; border-radius: 26px; background: var(--wash-strong); color: var(--green); font-size: 2.4rem; animation: float 4.5s ease-in-out infinite; }

/* Media queries ajustados */
@media (max-width: 1023px) {
  .catalogo__aside {
    position: static;
    margin-bottom: 24px;
  }
}

@media (max-width: 767px) {
  .catalogo__hero { padding: 26px 24px; }
  .deco-icon--1 { right: -20px; }
  .deco-icon--2, .deco-icon--3 { display: none; }
  
  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}
</style>