<template>
  <q-page class="home-page q-pa-lg">
    <section class="welcome-banner entrada">
      <div class="welcome-banner__content">
        <div class="eyebrow">Panel de control</div>
        <h1>Hola, {{ auth.usuario?.email?.split('@')[0] || 'equipo' }}.</h1>
        <p>Todo tu catálogo, ordenado para tomar decisiones más rápido.</p>
        <div class="welcome-banner__chips">
          <span class="chip-mini"><q-icon name="bolt" /> Sistema activo</span>
          <span class="chip-mini"><q-icon name="storefront" /> Catálogo en línea</span>
        </div>
      </div>
      <div class="welcome-banner__deco">
        <q-icon name="auto_awesome" class="welcome-banner__icon" />
        <q-icon name="inventory_2" class="welcome-banner__float welcome-banner__float--1" />
        <q-icon name="category" class="welcome-banner__float welcome-banner__float--2" />
      </div>
    </section>

    <div class="section-heading entrada" style="animation-delay: 90ms">
      <div>
        <div class="eyebrow">Accesos rápidos</div>
        <h2>¿Qué quieres gestionar?</h2>
      </div>
      <span class="status-dot"><i /> Sistema activo</span>
    </div>

    <div class="stats-grid entrada" style="animation-delay: 140ms">
      <q-card
        v-for="stat in statsCards"
        :key="stat.key"
        flat
        bordered
        class="stat-card"
      >
        <q-card-section class="row items-center no-wrap q-py-md">
          <div class="stat-card__icon"><q-icon :name="stat.icon" /></div>
          <div class="q-ml-md stat-card__content">
            <div class="stat-card__valor">
              <template v-if="stats">
                {{ stat.currency ? formatCurrency(displayStats[stat.key]) : displayStats[stat.key] }}
              </template>
              <div v-else class="skeleton skeleton--valor"></div>
            </div>
            <div class="stat-card__label">{{ stat.label }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="action-grid entrada" style="animation-delay: 190ms">
      <q-card
        v-for="action in actions"
        :key="action.route"
        flat
        bordered
        class="action-card"
        clickable
        @click="router.push({ name: action.route })"
      >
        <q-card-section>
          <div class="action-card__icon"><q-icon :name="action.icon" /></div>
          <div class="action-card__title">{{ action.title }}</div>
          <div class="action-card__description">{{ action.description }}</div>
          <q-icon name="arrow_forward" class="action-card__arrow" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/format';

const router = useRouter();
const auth = useAppStore();

const stats = ref(null);
const displayStats = reactive({
  totalProductos: 0,
  precioPromedio: 0,
  categorias: 0
});

const statsCards = [
  { key: 'totalProductos', icon: 'inventory_2', label: 'Productos totales', currency: false },
  { key: 'precioPromedio', icon: 'payments', label: 'Precio promedio', currency: true },
  { key: 'categorias', icon: 'category', label: 'Categorías', currency: false }
];

const actions = [
  { route: 'catalogo', icon: 'storefront', title: 'Explorar catálogo', description: 'Consulta productos y disponibilidad.' },
  { route: 'productos', icon: 'inventory_2', title: 'Productos', description: 'Actualiza precios, stock y fichas.' },
  { route: 'proveedores', icon: 'local_shipping', title: 'Proveedores', description: 'Mantén tus aliados al día.' },
  { route: 'categorias', icon: 'category', title: 'Categorías', description: 'Ordena la oferta de tu negocio.' }
];

function countUp(key, target, decimals = 0) {
  const inicio = performance.now();
  const duracion = 1300;

  const paso = (ahora) => {
    const p = Math.min(1, (ahora - inicio) / duracion);
    const suavizado = 1 - Math.pow(1 - p, 3);
    displayStats[key] = Number((target * suavizado).toFixed(decimals));
    if (p < 1) requestAnimationFrame(paso);
  };

  requestAnimationFrame(paso);
}

onMounted(async () => {
  try {
    const datos = await api.productos.stats();
    stats.value = datos;
    countUp('totalProductos', datos.totalProductos || 0);
    countUp('precioPromedio', datos.precioPromedio || 0, 2);
    countUp('categorias', datos.porCategoria?.length || 0);
  } catch {
    stats.value = { totalProductos: 0, precioPromedio: 0, porCategoria: [] };
  }
});
</script>

<style scoped>
.home-page { max-width: 1240px; margin: 0 auto; }

.welcome-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 220px;
  padding: 38px 44px;
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(115deg, var(--green-dark), var(--green) 60%, #1cae57 100%);
  background-size: 200% 200%;
  animation: gradient-pan 12s ease infinite;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  top: -60%;
  left: -20%;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  animation: float-slow 12s ease-in-out infinite;
  pointer-events: none;
}

.welcome-banner__content { position: relative; z-index: 1; }

.eyebrow { color: var(--green); font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.welcome-banner .eyebrow { color: var(--green-soft); }

h1, h2 { margin: 8px 0 0; letter-spacing: 0; }
h1 { font-size: clamp(2rem, 4vw, 3.25rem); animation: pop 0.7s var(--ease-spring) both; }

.welcome-banner p { max-width: 520px; margin: 12px 0 0; color: #d8f5df; font-size: 1rem; }

.welcome-banner__chips { display: flex; flex-wrap: wrap; }

.chip-mini {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 18px 10px 0 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.welcome-banner__deco { position: relative; }
.welcome-banner__icon { width: 150px; height: 150px; color: rgba(255, 255, 255, 0.18); font-size: 9rem; transform: rotate(10deg); animation: float 7s ease-in-out infinite; }

.welcome-banner__float { position: absolute; color: rgba(255, 255, 255, 0.28); animation: float 6s ease-in-out infinite; pointer-events: none; }
.welcome-banner__float--1 { top: 4px; right: 128px; font-size: 2rem; animation-delay: 1.2s; }
.welcome-banner__float--2 { bottom: 8px; right: 118px; font-size: 2.4rem; animation-delay: 2.4s; }

.section-heading { display: flex; align-items: end; justify-content: space-between; margin: 42px 0 18px; }
h2 { font-size: 1.6rem; }

.status-dot { color: var(--muted); font-size: .84rem; }
.status-dot i { display: inline-block; width: 8px; height: 8px; margin-right: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px var(--wash-strong); animation: blink 2.2s ease infinite; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }

.stat-card {
  border-radius: 18px;
  transition: transform 0.3s var(--ease-spring), box-shadow 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover { transform: translateY(-6px); border-color: var(--green-soft); box-shadow: var(--shadow-lg); }
.stat-card__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; background: var(--wash-strong); color: var(--green-dark); font-size: 1.6rem; transition: transform 0.3s var(--ease-spring); }
.stat-card:hover .stat-card__icon { transform: scale(1.12) rotate(-6deg); }
.stat-card__content { min-width: 0; }
.stat-card__valor {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat-card__label { color: var(--muted); font-size: 0.82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.skeleton--valor { width: 90px; height: 30px; }

.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.action-card {
  position: relative;
  min-height: 190px;
  border-radius: 18px;
  transition: transform 0.3s var(--ease-spring), box-shadow 0.3s ease, border-color 0.3s ease;
}

.action-card:hover { border-color: var(--green-soft); box-shadow: var(--shadow); transform: translateY(-6px) rotate(-1deg); }
.action-card__icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; color: var(--green-dark); background: var(--wash-strong); font-size: 1.35rem; transition: transform 0.3s var(--ease-spring); }
.action-card:hover .action-card__icon { animation: icon-bounce 0.55s var(--ease-spring); }
.action-card__title { margin-top: 20px; color: var(--ink); font-family: 'Space Grotesk', sans-serif; font-size: 1.08rem; font-weight: 700; }
.action-card__description { max-width: 180px; margin-top: 6px; color: var(--muted); font-size: .86rem; line-height: 1.45; }
.action-card__arrow { position: absolute; right: 20px; bottom: 20px; color: var(--green); transition: transform 0.3s var(--ease-out); }
.action-card:hover .action-card__arrow { transform: translateX(6px); }

@media (max-width: 900px) { .action-grid { grid-template-columns: repeat(2, 1fr); } .stats-grid { grid-template-columns: 1fr; } }
@media (max-width: 599px) {
  .welcome-banner { min-height: 210px; padding: 28px 24px; }
  .welcome-banner__icon, .welcome-banner__float { display: none; }
  .section-heading { align-items: start; flex-direction: column; gap: 14px; margin-top: 32px; }
  .action-grid { grid-template-columns: 1fr; }
}
</style>
