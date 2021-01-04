import Vue from 'vue';
import App from './App.vue';
import router from './router';
// import '@/assets/css/index.scss'
// import store from '@/store/index.js'

Vue.config.productionTip = false


new Vue({
  el: '#app',
  router,
  // store,
  render: h => h(App)
});
