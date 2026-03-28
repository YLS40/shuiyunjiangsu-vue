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
        <!-- 替换为预约ID -->
        <el-table-column prop="id" label="预约ID" width="150"></el-table-column>
        <!-- 商品名称映射tourismName -->
        <el-table-column prop="tourismName" label="商品名称" show-overflow-tooltip></el-table-column>
        <!-- 隐藏商品图片（预约表无该字段） -->
        <el-table-column prop="tourismImg" label="商品图片" v-if="false">
          <template #default="scope">
            <el-image style="width: 50px; height: 50px; border-radius: 5px" :src="scope.row.tourismImg" :preview-src-list="[scope.row.img]" preview-teleported></el-image>
          </template>
        </el-table-column>
        <!-- 商品价格 -->
        <el-table-column prop="tourismPrice" label="商品价格"></el-table-column>
        <!-- 商品ID -->
        <el-table-column prop="tourismId" label="商品ID"></el-table-column>
        <!-- 购买数量 -->
        <el-table-column prop="num" label="购买数量"></el-table-column>
        <!-- 商品总价 -->
        <el-table-column prop="total" label="商品总价">
          <template #default="scope">
            <span style="color: orangered; font-weight: bold">￥{{scope.row.total }}</span>
          </template>
        </el-table-column>
        <!-- 下单人映射手机号phone -->
        <el-table-column prop="phone" label="下单人（手机号）"></el-table-column>
        <!-- 下单时间映射createTime -->
        <el-table-column prop="createTime" label="下单时间" width="150"></el-table-column>
        <!-- 订单状态适配预约表的"待确认" -->
        <el-table-column prop="status" label="预约状态">
          <template #default="scope">
            <el-tag type="primary" v-if="scope.row.status === '待确认'">待确认</el-tag>
            <el-tag type="danger" v-if="scope.row.status === '已取消'">已取消</el-tag>
            <el-tag type="success" v-if="scope.row.status === '已完成'">已完成</el-tag>
          </template>
        </el-table-column>
        <!-- 隐藏支付单号（预约表无该字段） -->
        <el-table-column prop="payNo" label="支付单号" width="150" v-if="false"></el-table-column>
        <!-- 隐藏支付时间（预约表无该字段） -->
        <el-table-column prop="payTime" label="支付时间" width="150" v-if="false"></el-table-column>
        <!-- 简化操作列，移除发货按钮（预约无发货逻辑） -->
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
import {Delete, Edit} from "@element-plus/icons-vue";

const data = reactive({
  formVisible: false,
  form: {},
  tableData: [],
  pageNum: 1,
  pageSize: 10,
  total: 0,
  title: null,
  ids: [],
  orderNo: null // 复用该字段作为预约ID查询
})

// 核心修改：请求预约列表接口
const load = () => {
  // 替换为预约查询接口，兼容分页和ID查询
  request.get('http://localhost:8098/reservation/list').then(res => {
    if (res.code === '200') {
      // 过滤查询（如果输入了预约ID）
      let list = res.data || []
      if (data.orderNo) {
        list = list.filter(item => item.id.toString() === data.orderNo)
      }
      data.tableData = list
      data.total = list.length // 简单处理分页总数
    }
  })
}

// 激活单个删除功能（对接后端接口）
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗？', '删除确认', { type: 'warning' }).then(() => {
    request.delete('http://localhost:8098/reservation/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success("删除成功")
        load() // 删除后刷新列表
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      ElMessage.error("删除失败：网络异常")
      console.error(err)
    })
  }).catch(err => {
    console.error(err)
  })
}

// 激活批量删除功能（对接后端接口）
const delBatch = () => {
  if (!data.ids.length) {
    ElMessage.warning("请选择要删除的预约记录")
    return
  }
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除选中的预约记录吗？', '批量删除确认', { type: 'warning' }).then(() => {
    request.delete('http://localhost:8098/reservation/delete/batch', {
      data: data.ids // 传递选中的ID列表
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success(res.msg)
        load() // 删除后刷新列表
        data.ids = [] // 清空选中的ID
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      ElMessage.error("批量删除失败：网络异常")
      console.error(err)
    })
  }).catch(err => {
    console.error(err)
  })
}

const handleSelectionChange = (rows) => {
  data.ids = rows.map(v => v.id)
}

const reset = () => {
  data.orderNo = null
  load()
}

load()
</script>