import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入并执行
import './plugins/element.js'
// 导入element样式库
import 'element-ui/lib/theme-chalk/index.css'
// 导入图标样式
import './assets/fonts/iconfont.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入axios
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import NProgress from 'nprogress'
// 引入全局样式表
import './assets/css/global.css'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中，展示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.filter('dateFormat', function(originValue) {
  const dt = new Date(originValue)
  var y = dt.getFullYear()
  var m = (dt.getMonth() + 1 + '').padStart(2, '0')
  var d = (dt.getDate() + '').padStart(2, '0')
  var hh = (dt.getHours() + '').padStart(2, '0')
  var mm = (dt.getMinutes() + '').padStart(2, '0')
  var s = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${s}`
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
