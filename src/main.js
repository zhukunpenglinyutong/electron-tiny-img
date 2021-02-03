import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// 引入Element.ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// 引入 Ant Design of Vue
import antDesignVue from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(antDesignVue);

new Vue({
  render: h => h(App)
}).$mount('#app')
