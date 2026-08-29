// Funciones complejas de fechas, reutilizadas en toda la aplicación.
export function useDate() {
  function formatDate(valor, opciones = {}) {
    if (!valor) return '—';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '—';
    return new Intl.DateTimeFormat('es', { dateStyle: 'long', ...opciones }).format(fecha);
  }

  function formatDateTime(valor) {
    return formatDate(valor, { dateStyle: 'medium', timeStyle: 'short' });
  }

  return { formatDate, formatDateTime };
}
