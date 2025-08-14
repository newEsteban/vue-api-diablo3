import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// BootstrapVue
import './plugins/bootstrapVue'
// Vue Font-Awesome
import './plugins/fontAwesome'
// Custom directives
import './directives'
// CSS global
import './assets/css/main.styl'
Vue.config.productionTip = false

new Vue({
  router,
  store,
  methods: {
    // Función de inicialización que obtiene el token OAuth automáticamente
    init () {
      // Disparar la acción para obtener token de Blizzard Battle.net
      // Ver documentación completa en AUTENTICACION.md
      store.dispatch('oauth/getToken')
    }
  },
  // Hook created
  created () {
    this.init()
  },
  render: h => h(App)
}).$mount('#app')
