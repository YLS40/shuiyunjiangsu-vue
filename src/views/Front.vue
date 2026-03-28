<template>
  <div>
    <div class="front-notice">
      <div style="padding-left: 40px; flex: 1">
        <i style="font-size: 20px; color: #189500">上水韵江苏文旅服务网站，带你看不一样的江苏！</i>
      </div>
      <iframe scrolling="no" src="https://widget.tianqiapi.com/?style=tg&skin=pitaya" frameborder="0" width="470" height="40" allowtransparency="true"></iframe>
    </div>
    <div class="front-header">
      <a href="/front/home">
        <div class="front-header-left">
          <img src="@/assets/imgs/logo.png" alt="">
          <div class="title">水韵江苏文旅服务网站</div>
        </div>
      </a>
      <div class="front-header-center">
        <el-menu :default-active="router.currentRoute.value.path" router mode="horizontal">
          <el-menu-item index="/front/home">首页</el-menu-item>
          <el-menu-item index="/front/article">旅游攻略</el-menu-item>
          <el-menu-item index="/front/routes">旅游路线</el-menu-item>
          <el-menu-item index="/front/tourism">去旅游</el-menu-item>
          <el-menu-item index="/front/feedback">问题反馈</el-menu-item>
        </el-menu>
      </div>
      <div style="width: 400px">
        <el-input style="width: 300px; margin-right: 5px" v-model="data.search" placeholder="请输入目的地搜索"></el-input>
        <el-button type="primary" @click="searchTourism">搜索</el-button>
      </div>
      <div class="front-header-right">
        <div v-if="!data.user.id">
          <el-button @click="router.push('/login')">登录</el-button>
          <el-button @click="router.push('/register')">注册</el-button>
        </div>
        <div v-else>
          <el-dropdown style="cursor: pointer; height: 60px">
            <div style="display: flex; align-items: center">
              <img style="width: 40px; height: 40px; border-radius: 50%;" :src="data.user.avatar" alt="">
              <span style="margin-left: 5px;">{{ data.user.name }}</span><el-icon><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-item @click="goPage('/front/orders')">我的订单</el-dropdown-item>
              <el-dropdown-item @click="goPage('/front/myFeedback')">我的反馈</el-dropdown-item>
              <el-dropdown-item @click="goPage('/front/travels')">我的游记</el-dropdown-item>
              <el-dropdown-item @click="goPage('/front/collect')">我的收藏</el-dropdown-item>
              <el-dropdown-item @click="goPage('/front/person')">个人信息</el-dropdown-item>
              <el-dropdown-item @click="goPage('/front/password')">修改密码</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="main-body">
      <RouterView @updateUser="updateUser" />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { reactive } from "vue";
import request from "@/utils/request.js";
import Footer from '@/components/Footer.vue'
import { ElMessage } from "element-plus";
import { ArrowDown } from '@element-plus/icons-vue'

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  top: '',
  noticeData: [],
  search: ''
})

// ===================== 修复：统一使用正确的登录判断 =====================
const goPage = (path) => {
  const userStr = localStorage.getItem('xm-user')
  if (!userStr || userStr === '{}') {
    ElMessage.warning('请先登录后再访问该功能')
    router.push('/login')
    return
  }
  // 修复：用 router.push 而不是 location.href
  router.push(path)
}

const logout = () => {
  localStorage.clear()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

const updateUser = () => {
  data.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
}

// 搜索旅游相关内容
const searchTourism = () => {
  // 检查登录状态
  const userStr = localStorage.getItem('xm-user');
  if (!userStr || userStr === '{}') {
    ElMessage.warning('请先登录后再进行搜索');
    router.push('/login');
    return;
  }
  
  if (!data.search) {
    ElMessage.warning('请输入搜索内容');
    return;
  }
  // 跳转到搜索页面，不指定默认标签页，让用户可以选择所有标签页
  router.push('/front/search?name=' + data.search);
}

const loadNotice = () => {
  request.get('/notice/selectAll').then(res => {
    data.noticeData = res.data
    let i = 0
    if (data.noticeData && data.noticeData.length) {
      data.top = data.noticeData[0].content
      setInterval(() => {
        data.top = data.noticeData[i].content
        i++
        if (i === data.noticeData.length) {
          i = 0
        }
      }, 2500)
    }
  })
}
loadNotice()
</script>

<style scoped>
@import "@/assets/css/front.css";
</style>