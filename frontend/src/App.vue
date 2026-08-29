<template>
  <RouterView />
</template>


<style>
.form-dialog {
  width: 100%;
  max-width: 560px;
  border-radius: 20px !important;
  background: #ffffff;
}

.form-dialog__header {
  padding: 20px 24px 12px;
}

.form-dialog__body {
  padding: 12px 24px 20px;
}

.dialogo-moderno__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--wash-strong, #eaf8f0);
  color: var(--green-dark, #159447);
  font-size: 1.25rem;
}

.form-dialog__title {
  font-weight: 700;
}
</style>