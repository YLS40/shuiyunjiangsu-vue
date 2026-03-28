<template>
  <div style="width: 60%; margin: 10px auto" class="card">
    <div style="margin-bottom: 10px">
      <el-input v-model="data.title" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入标题查询"></el-input>
      <el-button type="info" plain @click="load">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <div style="margin-bottom: 10px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="userName" label="发布人" />
        <el-table-column prop="time" label="发布时间" width="200" />
        <el-table-column prop="reply" label="回复" />
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>
  </div>
</template>

<script setup>
// ==============================================
// ✅ 登录判断必须写在【第一行】【最前面】
// ==============================================
import router from "@/router/index.js";
import { ElMessage } from "element-plus";

const user = JSON.parse(localStorage.getItem('xm-user') || '{}');
if (!user || !user.token) {
  ElMessage.warning("请先登录后再访问问题反馈");
  router.push("/login");
}

// ==============================================
// 下面是正常代码（不动）
// ==============================================
import { ref, reactive, onMounted } from "vue";
import request from "@/utils/request.js";
import { ElMessageBox } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  title: null,
  ids: [],
})

const formRef = ref()

onMounted(() => {
  load()
})

const load = () => {
  request.get('/feedback/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      title: data.title
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data?.list || []
      data.total = res.data?.total
    }
  })
}

const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(() => {
    request.delete('/feedback/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
      }
    })
  }).catch(() => {})
}

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const reset = () => {
  data.title = null
  load()
}
</script>