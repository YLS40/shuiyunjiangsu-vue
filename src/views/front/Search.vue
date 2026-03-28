<template>
  <div>
    <div class="bg"></div>
    <div style="width: 60%; margin: 20px auto">
      <div style="margin-bottom: 20px">
        <el-input size="large" clearable style="width: 500px; margin-right: 5px" v-model="data.keyword" placeholder="请输入搜索内容"></el-input>
        <el-button size="large"  type="primary" @click="load">搜索</el-button>
      </div>

      <div style="margin: 20px 0">
        <div style="margin-bottom: 20px">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="旅游攻略" name="article"></el-tab-pane>
            <el-tab-pane label="旅游路线" name="routes"></el-tab-pane>
            <el-tab-pane label="旅游团" name="tourism"></el-tab-pane>
          </el-tabs>
        </div>

        <!-- 旅游攻略搜索结果 -->
        <div v-if="activeTab === 'article'">
          <el-row :gutter="20">
            <el-col :span="8" v-for="item in data.articleList" :key="item.id" style="margin-bottom: 20px; cursor: pointer" @click="goPage('/front/articleDetail?id=' + item.id)">
              <div style="border: 1px solid #e4e7ed; border-radius: 5px; overflow: hidden">
                <img :src="item.cover" alt="" style="width: 100%; height: 150px">
                <div style="padding: 10px">
                  <div style="font-size: 16px; margin-bottom: 8px; font-weight: bold" class="line2 title">{{ item.title }}</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px">
                    <span>{{ item.time }}</span>
                    <span style="margin: 0 10px">|</span>
                    <span>阅读 {{ item.readCount }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <div style="margin: 10px 0" v-if="data.articleTotal">
            <el-pagination size="small" @current-change="loadArticle" background layout="total, prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.articlePageNum" :total="data.articleTotal" />
          </div>
        </div>

        <!-- 旅游路线搜索结果 -->
        <div v-if="activeTab === 'routes'">
          <el-row :gutter="20">
            <el-col :span="8" v-for="item in data.routesList" :key="item.id" style="margin-bottom: 20px; cursor: pointer" @click="goPage('/front/routesDetail?id=' + item.id)">
              <div style="border: 1px solid #e4e7ed; border-radius: 5px; overflow: hidden">
                <img :src="item.img" alt="" style="width: 100%; height: 150px">
                <div style="padding: 10px">
                  <div style="font-size: 16px; margin-bottom: 8px; font-weight: bold" class="line2 title">{{ item.name }}</div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px">
                    <span>{{ item.days }}天</span>
                    <span style="margin: 0 10px">|</span>
                    <span>{{ item.location }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <div style="margin: 10px 0" v-if="data.routesTotal">
            <el-pagination size="small" @current-change="loadRoutes" background layout="total, prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.routesPageNum" :total="data.routesTotal" />
          </div>
        </div>

        <!-- 旅游团搜索结果 -->
        <div v-if="activeTab === 'tourism'">
          <div v-if="data.tourismList.length > 0">
            <el-row :gutter="20">
              <el-col :span="6" v-for="item in data.tourismList" :key="item.id" style="margin-bottom: 20px; cursor: pointer" @click="goPage('/front/tourismDetail?id=' + item.id)">
                <img :src="item.img" alt="" style="width: 100%; height: 130px; border-radius: 5px">
                <div style="font-size: 16px; margin: 5px 0" class="line2 title">{{ item.name }}</div>
                <div style="display: flex; align-items: center">
                  <div style="color: orange; font-size: 20px; font-weight: bold; flex: 1">￥{{ item.price }}</div>
                  <div style="color: #666">已售 {{ item.orderNum }}</div>
                </div>
              </el-col>
            </el-row>
            <div style="margin: 10px 0" v-if="data.tourismTotal">
              <el-pagination size="small" @current-change="loadTourism" background layout="total, prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.tourismPageNum" :total="data.tourismTotal" />
            </div>
          </div>
          <div v-else style="text-align: center; padding: 50px 0; font-size: 16px; color: #666">
            <el-empty description="还未上架该地点旅游团" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import request from "@/utils/request.js";
import router from "@/router/index.js";
import { ElMessage } from "element-plus";

const activeTab = ref(router.currentRoute.value.query.tab || 'article');

const data = reactive({
  // 旅游攻略数据
  articleList: [],
  articlePageNum: 1,
  articleTotal: 0,
  // 旅游路线数据
  routesList: [],
  routesPageNum: 1,
  routesTotal: 0,
  // 旅游团数据
  tourismList: [],
  tourismPageNum: 1,
  tourismTotal: 0,
  // 公共参数
  pageSize: 8,
  keyword: router.currentRoute.value.query.name || '',
})

const goPage = (path) => {
  router.push(path);
}

// 加载旅游攻略数据
const loadArticle = (pageNum = 1) => {
  if (!checkLogin()) return;
  data.articlePageNum = pageNum;
  request.get('/article/selectPage', {
    params: {
      pageNum: data.articlePageNum,
      pageSize: data.pageSize,
      title: data.keyword
    }
  }).then(res => {
    if (res.code === '200') {
      data.articleList = res.data?.list || [];
      data.articleTotal = res.data?.total || 0;
    }
  });
}

// 加载旅游路线数据
const loadRoutes = (pageNum = 1) => {
  if (!checkLogin()) return;
  data.routesPageNum = pageNum;
  request.get('/routes/selectPage', {
    params: {
      pageNum: data.routesPageNum,
      pageSize: data.pageSize,
      name: data.keyword
    }
  }).then(res => {
    if (res.code === '200') {
      data.routesList = res.data?.list || [];
      data.routesTotal = res.data?.total || 0;
    }
  });
}

// 加载旅游团数据
const loadTourism = (pageNum = 1) => {
  if (!checkLogin()) return;
  data.tourismPageNum = pageNum;
  console.log('搜索关键词:', data.keyword);
  request.get('/tourism/selectPage', {
    params: {
      pageNum: data.tourismPageNum,
      pageSize: data.pageSize,
      name: data.keyword
    }
  }).then(res => {
    console.log('旅游团搜索结果:', res);
    if (res.code === '200') {
      data.tourismList = res.data?.list || [];
      data.tourismTotal = res.data?.total || 0;
      console.log('旅游团列表:', data.tourismList);
      console.log('旅游团总数:', data.tourismTotal);
    }
  });
}

// 切换标签页时加载对应数据
const load = () => {
  if (!checkLogin()) return;
  if (activeTab.value === 'article') {
    loadArticle();
  } else if (activeTab.value === 'routes') {
    loadRoutes();
  } else if (activeTab.value === 'tourism') {
    loadTourism();
  }
}

// 处理标签页切换
const handleTabChange = (tab) => {
  load();
}

// 检查登录状态
const checkLogin = () => {
  const userStr = localStorage.getItem('xm-user');
  if (!userStr || userStr === '{}') {
    ElMessage.warning('请先登录后再进行搜索');
    router.push('/login');
    return false;
  }
  return true;
}

// 初始化加载数据
onMounted(() => {
  if (!checkLogin()) return;
  load();
});
</script>

<style scoped>
.bg {
  height: 400px;
  background-image: url("@/assets/imgs/lysp.jpg");
  background-size: 100% 110%;
}
.active {
  color: red;
}
.title:hover {
  color: orangered!important;
}
</style>