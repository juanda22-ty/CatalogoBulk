// Funciones simples y reutilizables para formateo de valores.

export const formatCurrency = (valor) =>
  valor == null ? '—' : `$${Number(valor).toFixed(2)}`;
