<template>
  <div style="width: 60%; margin: 10px auto">
    <div style="display: flex; grid-gap: 20px">
      <div style="flex: 1">
        <img :src="data.tourism.img" alt="旅游产品图片" style="width: 100%; height: 300px; object-fit: cover">
      </div>

      <div style="flex: 1">
        <div style="font-size: 20px; font-weight: 500">{{ data.tourism.name }}</div>
        <div style="margin: 10px 0">
          <el-tag style="margin-right: 10px" v-for="(item, index) in JSON.parse(data.tourism.specials || '[]')" key="index">{{ item }}</el-tag>
        </div>
        <div style="margin: 10px 0; color: #666; font-size: 13px; line-height: 1.5">{{ data.tourism.descr }}</div>
        <div style="margin: 10px 0; background-color: #eee; padding: 15px; display: flex; align-items: baseline">
          <span style="font-size: 24px; font-weight: bold; color: orangered; margin-right: 30px">人均￥{{ data.tourism.price }} 起</span>
          <span style="color: #666">余位：{{ data.tourism.store || 0 }}</span>
        </div>
        <div style="margin: 10px 0; color: #666; font-size: 13px; line-height: 1.5">
          预约须知：提交后商家最晚会在2个工作小时内（工作日9:00-18:00）联系您确认行程细节
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <!-- 仅保留立即预约按钮 -->
          <el-button
            @click="addReservation"
            style="padding: 10px 30px; background-color: orange; border-color: orange; color: #fff"
            :disabled="!data.tourism.store || data.tourism.store <= 0"
          >
            {{ data.tourism.store && data.tourism.store > 0 ? '立即预约' : '暂无余位' }}
          </el-button>
          <!-- AI客服按钮 -->
          <el-button
            @click="openAIChat"
            style="padding: 10px 30px; background-color: #189000; border-color: #189000; color: #fff"
          >
            立即咨询AI客服
          </el-button>
        </div>
      </div>
    </div>

    <div style="margin: 20px 0">
      <div style="padding-left: 10px; border-left: 5px solid #189000; font-size: 20px; margin: 20px 0">详细介绍</div>
      <div style="line-height: 1.6">
        <div v-html="data.tourism.content"></div>
      </div>
    </div>

    <el-dialog title="行程预约" v-model="data.formVisible" width="40%" destroy-on-close>
      <!-- ✅ 修复了 label-width 语法错误 -->
      <el-form label-width="70px" style="padding: 20px" :model="data.form">
        <el-form-item label="行程名称">{{ data.tourism.name }}</el-form-item>
        <el-form-item label="参考报价">{{ data.tourism.price }} 起/人</el-form-item>
        <el-form-item label="出行人数">
          <el-input-number
            :min="1"
            :max="Math.min(10, data.tourism.store || 1)"
            style="width: 150px"
            v-model="data.form.num"
            @change="changeNum"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="出行日期">
          <el-date-picker
            v-model="data.form.travelDate"
            type="date"
            placeholder="选择预计出行日期"
            style="width: 100%"
            :disabled-date="(date) => date < new Date()"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="data.form.phone"
            placeholder="请填写手机号，客服将联系您"
            maxlength="11"
            oninput="value=value.replace(/[^\d]/g,'')"
          ></el-input>
        </el-form-item>
        <el-form-item label="预算参考">
          <span style="color: red; font-weight: bold; font-size: 16px">￥{{ data.form.total || 0 }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">关 闭</el-button>
          <el-button type="primary" @click="saveReservation" :loading="data.submitting">提交预约</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import request from "@/utils/request.js";
import router from "@/router/index.js";
import { ElMessage } from "element-plus";

const data = reactive({
  id: router.currentRoute.value.query.id,
  tourism: {},
  formVisible: false,
  submitting: false,
  form: { tourismId: '', tourismName: '', tourismPrice: 0, num: 1, total: 0, travelDate: '', phone: '' }
})

// 原有功能代码
const changeNum = () => {
  if (data.tourism.price && data.form.num) {
    data.form.total = Number(data.tourism.price) * Number(data.form.num);
  }
}
const saveReservation = async () => {
  if (data.submitting) return;
  if (!data.form.travelDate) { ElMessage.warning("请选择预计出行日期！"); return; }
  if (!/^1[3-9]\d{9}$/.test(data.form.phone)) { ElMessage.warning("请填写正确的11位手机号！"); return; }
  if (!data.form.num || data.form.num <= 0) { ElMessage.warning("请选择正确的出行人数！"); return; }
  try {
    data.submitting = true
    const submitData = { ...data.form, tourismId: Number(data.form.tourismId) }
    const res = await request.post('/reservation/add', submitData)
    if (res.code === '200') {
      ElMessage.success('预约提交成功！');
      data.formVisible = false
      data.form = { tourismId: '', tourismName: '', tourismPrice: 0, num: 1, total: 0, travelDate: '', phone: '' }
    } else ElMessage.error(res.msg || '提交失败')
  } catch (err) { ElMessage.error('网络异常') }
  finally { data.submitting = false }
}
const addReservation = () => {
  let user = JSON.parse(localStorage.getItem('xm-user') || '{}')
  if (!user.token) { ElMessage.warning('请先登录'); router.push('/login'); return; }
  data.formVisible = true
  data.form.tourismId = data.tourism.id
  data.form.tourismName = data.tourism.name
  data.form.tourismPrice = Number(data.tourism.price) || 0
  data.form.num = 1
  data.form.total = data.form.tourismPrice
  data.form.travelDate = ''
  data.form.phone = ''
}

// 打开AI客服
const openAIChat = () => {
  if (window.openAIChat) {
    window.openAIChat();
  } else {
    ElMessage.info('AI客服正在初始化，请稍后再试');
  }
}
const loadTourismDetail = () => {
  if (!data.id) { ElMessage.warning('未获取产品ID'); router.push('/front/tourism'); return; }
  request.get('/tourism/selectById/' + data.id).then(res => {
    if (res.code === '200' && res.data) data.tourism = res.data
    else ElMessage.error('加载失败')
  })
}
onMounted(() => { loadTourismDetail(); });
</script>

<style scoped>
:deep(.el-form-item__label) { font-weight: bold !important; }
:deep(.el-form-item) { margin-bottom: 15px; }
:deep(.el-date-editor), :deep(.el-input) { width: 100%; }
:deep(.el-dialog__body) { padding: 20px; }
:deep(.el-tag) { margin-bottom: 5px; }
</style>