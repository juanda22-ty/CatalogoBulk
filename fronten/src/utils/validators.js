// Funciones simples y reutilizables.
// Reglas de validación para formularios (Quasar).

export const required = (mensaje = 'Este campo es requerido') => (valor) =>
  !!valor || mensaje;

export const validEmail = (mensaje = 'Ingresa un email válido') => (valor) =>
  !valor || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(valor) || mensaje;
