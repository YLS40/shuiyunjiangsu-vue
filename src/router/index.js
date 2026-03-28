import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/front/home' },
    {
      path: '/manager',
      component: () => import('@/views/Manager.vue'),
      children: [
        { path: 'home', meta: { name: '系统首页' }, component: () => import('@/views/manager/Home.vue'),  },
        { path: 'admin', meta: { name: '管理员信息' }, component: () => import('@/views/manager/Admin.vue'), },
        { path: 'notice', meta: { name: '系统公告' }, component: () => import('@/views/manager/Notice.vue'), },
        { path: 'person', meta: { name: '个人资料' }, component: () => import('@/views/manager/Person.vue'), },
        { path: 'password', meta: { name: '修改密码' }, component: () => import('@/views/manager/Password.vue'), },
        { path: 'article', meta: { name: '旅游攻略信息' }, component: () => import('@/views/manager/Article.vue'), },
        { path: 'routes', meta: { name: '旅游路线信息' }, component: () => import('@/views/manager/Routes.vue'), },
        { path: 'travels', meta: { name: '游记信息' }, component: () => import('@/views/manager/Travels.vue'), },
        { path: 'user', meta: { name: '用户信息' }, component: () => import('@/views/manager/User.vue'), },
        { path: 'comment', meta: { name: '评论信息' }, component: () => import('@/views/manager/Comment.vue'), },
        { path: 'collect', meta: { name: '收藏信息' }, component: () => import('@/views/manager/Collect.vue'), },
        { path: 'tourism', meta: { name: '旅游产品管理' }, component: () => import('@/views/manager/Tourism.vue'), },
        { path: 'orders', meta: { name: '预约信息' }, component: () => import('@/views/manager/Orders.vue'), },
        { path: 'feedback', meta: { name: '反馈信息' }, component: () => import('@/views/manager/Feedback.vue'), },
      ]
    },
    {
      path: '/front',
      component: () => import('@/views/Front.vue'),
      children: [
        { path: 'home', meta: { name: '水韵江苏文旅服务网-首页' }, component: () => import('@/views/front/Home.vue'),  },
        { path: 'person', component: () => import('@/views/front/Person.vue'),  },
        { path: 'password', component: () => import('@/views/front/Password.vue'),  },
        { path: 'addTravel', component: () => import('@/views/front/AddTravel.vue'),  },
        { path: 'travels', component: () => import('@/views/front/Travels.vue'),  },
        { path: 'travelDetail', component: () => import('@/views/front/TravelDetail.vue'),  },
        { path: 'article', component: () => import('@/views/front/Article.vue'),  },
        { path: 'articleDetail', component: () => import('@/views/front/ArticleDetail.vue'),  },
        { path: 'collect', component: () => import('@/views/front/Collect.vue'),  },
        { path: 'routes', component: () => import('@/views/front/Routes.vue'),  },
        { path: 'routesDetail', component: () => import('@/views/front/RoutesDetail.vue'),  },
        { path: 'tourism', component: () => import('@/views/front/Tourism.vue'),  },
        { path: 'tourismDetail', component: () => import('@/views/front/TourismDetail.vue'),  },
        { path: 'orders', component: () => import('@/views/front/Orders.vue'),  },
        { path: 'search', component: () => import('@/views/front/Search.vue'),  },
        { path: 'feedback', component: () => import('@/views/front/Feedback.vue'),  },
        { path: 'myFeedback', component: () => import('@/views/front/MyFeedback.vue'),  },
      ]
    },
    { path: '/login', component: () => import('@/views/Login.vue') },
    { path: '/adminLogin', component: () => import('@/views/AdminLogin.vue') },
    { path: '/register', component: () => import('@/views/Register.vue') },
    { path: '/404', component: () => import('@/views/404.vue') },
    { path: '/:pathMatch(.*)', redirect: '/404' }
  ]
})

// 页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.name) {
    document.title = to.meta.name;
  } else {
    document.title = '水韵江苏文旅服务网';
  }
  next();
})

// 登录拦截
const needLoginPaths = [
  '/front/person',
  '/front/password',
  '/front/addTravel',
  '/front/collect',
  '/front/orders',
  '/front/feedback',
  '/front/myFeedback'
]

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('xm-user')
  let isLoggedIn = false

  if (userStr && userStr !== '{}') {
    try {
      const user = JSON.parse(userStr)
      isLoggedIn = !!(user.token || user.id)
    } catch (e) {
      isLoggedIn = false
    }
  }

  if (needLoginPaths.includes(to.path) && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router;