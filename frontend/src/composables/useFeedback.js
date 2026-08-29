import { Dialog, Notify } from 'quasar';

// Feedback global: confirmación antes de cada cambio + notificación del resultado.
export function useFeedback() {
  function confirmar({
    title = 'Confirmar',
    message = '¿Seguro que deseas continuar?',
    okLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    okColor = 'primary'
  } = {}) {
    return new Promise((resolve) => {
      Dialog.create({
        title,
        message,
        persistent: true,
        cancel: { label: cancelLabel, flat: true, color: 'primary' },
        ok: { label: okLabel, color: okColor }
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false));
    });
  }

  function notificar(message, type = 'positive') {
    Notify.create({ message, type, position: 'top' });
  }

  return { confirmar, notificar };
}
