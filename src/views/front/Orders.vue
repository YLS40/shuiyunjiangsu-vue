<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input v-model="data.orderNo" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入预约ID查询"></el-input>
      <el-button type="info" plain @click="load">查询</el-button>
      <el-button type="warning" plain style="margin: 0 10px" @click="reset">重置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px">
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="预约ID" width="150"></el-table-column>
        <el-table-column prop="tourismName" label="商品名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="tourismPrice" label="商品价格"></el-table-column>
        <el-table-column prop="tourismId" label="商品ID"></el-table-column>
        <el-table-column prop="num" label="购买数量"></el-table-column>
        <el-table-column prop="total" label="商品总价">
          <template #default="scope">
            <span style="color: orangered; font-weight: bold">￥{{scope.row.total }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="下单人（手机号）"></el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="150"></el-table-column>
        <el-table-column prop="status" label="预约状态">
          <template #default="scope">
            <el-tag type="primary" v-if="scope.row.status === '待确认'">待确认</el-tag>
            <el-tag type="danger" v-if="scope.row.status === '已取消'">已取消</el-tag>
            <el-tag type="success" v-if="scope.row.status === '已完成'">已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="scope">
            <el-button type="danger" circle :icon="Delete" @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card" v-if="data.total">
      <el-pagination @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total" />
    </div>
  </div>
</template>

<script setup>
import {reactive} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Delete} from "@element-plus/icons-vue";

const data = reactive({
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  ids: [],
  orderNo: null
})

// 加载预约列表（真实对接后端）
const load = () => {
  request.get('http://localhost:8098/reservation/list').then(res => {
    if (res.code === '200') {
      let list = res.data || []
      // 过滤预约ID（仅当输入时过滤）
      if (data.orderNo && data.orderNo.trim() !== '') {
        list = list.filter(item => item.id && item.id.toString() === data.orderNo.trim())
      }
      data.tableData = list
      data.total = list.length
      // 同步更新首页的统计数据（关键：通知Home.vue刷新）
      window.dispatchEvent(new CustomEvent('reservationDataChange'))
    }
  })
}

// 单个删除
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(() => {
    request.delete('http://localhost:8098/reservation/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load() // 刷新列表
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      ElMessage.error("删除失败：网络异常")
      console.error(err)
    })
  })
}

// 批量删除
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择要删除的预约记录")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '批量删除确认', { type: 'warning' }).then(() => {
    request.delete('http://localhost:8098/reservation/delete/batch', {
      data: data.ids
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success(res.msg)
        load() // 刷新列表
        data.ids = []
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      ElMessage.error("批量删除失败：网络异常")
      console.error(err)
    })
  })
}

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const reset = () => {
  data.orderNo = null
  load()
}

// 页面加载时初始化
load()
</script>