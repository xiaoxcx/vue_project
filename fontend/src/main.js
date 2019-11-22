// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'normalize.css';
import 'babel-polyfill';
import 'element-ui/lib/theme-chalk/index.css';
import 'v-charts/lib/style.css';
import Vue from 'vue';
import VCharts from 'v-charts';
import Vuex from 'vuex';
import ElementUI from 'element-ui';
import axios from 'axios';
import './common/stylus/style.styl';
import App from './App';
import router, { authRouter } from './router';
import store from './store';
import { timeDifference } from './tools/index';

Vue.use(Vuex);
Vue.use(ElementUI);
Vue.use(VCharts);
Vue.config.productionTip = false;
axios.defaults.baseURL = process.env.BASE_URL;
Vue.prototype.$axios = axios;
Vue.prototype.globalVariable = {
  duration: 500
};
Vue.prototype.$tips = ({ duration, type, message }) => {
  Vue.prototype.$message({
    duration: duration || 2000,
    showClose: true,
    type,
    message
  });
};

/* 路由守卫，判断用户登录状态，如果用户没有点击退出登录直接关闭浏览器，则1小时内打开网站自动登录 */
router.beforeEach((to, from, next) => {
  store.commit('changeRouterMatched', {
    router: to.matched
  });
  const uid = JSON.parse(JSON.stringify(localStorage.getItem('username')));
  const pastTime = JSON.parse(JSON.stringify(localStorage.getItem('currentTime')));
  const currentTime = new Date().getTime();
  const diffMinute = timeDifference(pastTime, currentTime).minute;
  /* 动态路由相关js */
  if (+store.getters.user.uid === 1) {
    if (store.getters.newrouter.length !== 0) {
      next();
    } else {
      router.addRoutes(authRouter);
      store.commit('setNewRouter', {
        newrouter: authRouter
      });
    }
  }
  /* 动态路由相关js */
  /* 判断是否在内页刷新，取消加载动画 */
  if (document.getElementById('Loading-wrapper') && (store.getters.isLoadComplete === 'true' || store.getters.isLoadComplete === true)) {
    document.body.removeChild(document.getElementById('Loading-wrapper'));
    next();
  }
  /* 判断是否在内页刷新，取消加载动画 */
  if (uid === null && to.path !== '/') {
    Vue.prototype.$tips({
      message: '登录过期，请重新登录1',
      type: 'error'
    });
    next('/');
  } else if (uid !== null && diffMinute > 59 && to.path !== '/') {
    localStorage.clear();
    Vue.prototype.$tips({
      message: '登录过期，请重新登录2',
      type: 'error'
    });
    next('/');
  } else if (uid !== null && to.path === '/') {
    next('/index');
  } else {
    /* 用于分步表格判断路由是否点击的是下一步，如果不是则把step重置为1 */
    if (to.path !== '/stepForm/step2' && to.path !== '/stepForm/step3') {
      store.commit('changePageNumber', 1);
    }
    next();
  }
});

/* 添加请求拦截器 */
const record = {};// 用来存储请求和响应的信息
const filterUrl = [`${process.env.BASE_URL}/api/log/insertOperationLog`, `${process.env.BASE_URL}/api/user/userLoginCount`, `${process.env.BASE_URL}/api/spider/hitokoto`, 'https://api.github.com/repos/xypecho/vue-full-stack-project/commits', `${process.env.BASE_URL}/api/user/md5Password`, `${process.env.BASE_URL}/api/user/userInfo`]; // 不需要拦截的请求的url
axios.interceptors.request.use(
  config => {
    if (filterUrl.indexOf(`${config.baseURL}${config.url}`) === -1 && filterUrl.indexOf(`${config.url}`) === -1) {
      // console.log(config);
      const { data, url } = config;
      record.request = { data, url };
    }
    return config;
  },
  error =>
    Promise.reject(error)
);

/* 添加响应拦截器,先注释，响应太快，基本看不到loading效果... */
axios.interceptors.response.use(
  response => {
    if (filterUrl.indexOf(response.config.url) === -1) {
      // console.log(response);
      const { data, status } = response;
      const { uid, username } = store.getters.user;
      record.response = { data, status };
      record.user = { uid, username };
      /* 将接口的url和返回数据插入数据库 */
      axios.post('/api/log/insertOperationLog', { record: JSON.stringify(record) });
    }
    return response;
  },
  error =>
    Promise.reject(error)
);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
