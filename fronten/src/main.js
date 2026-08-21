import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog } from 'quasar';
import langEs from 'quasar/lang/es';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './App.vue';
import router from './router';
import './styles/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Quasar, {
  lang: langEs,
  plugins: { Notify, Dialog },
  config: {
    notify: { position: 'top' }
  }
});

app.mount('#app');
