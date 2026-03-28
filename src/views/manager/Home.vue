<template>
  <div>
    <div style="display: flex; align-items: center; grid-gap: 15px">
      <div class="card item">
        <div style="flex: 1; text-align: center">
          <img src="@/assets/imgs/游记.png" alt="" style="width: 60px; height: 60px">
        </div>
        <div style="flex: 1; font-size: 20px">
          <div style="margin-bottom: 5px">游记总数</div>
          <div style="font-weight: bold">{{ data.count.travelsCount || 0 }}</div>
        </div>
      </div>
      <div class="card item">
        <div style="flex: 1; text-align: center">
          <img src="@/assets/imgs/攻略.png" alt="" style="width: 60px; height: 60px">
        </div>
        <div style="flex: 1; font-size: 20px">
          <div style="margin-bottom: 5px">攻略总数</div>
          <div style="font-weight: bold">{{ data.count.articleCount || 0 }}</div>
        </div>
      </div>
      <div class="card item">
        <div style="flex: 1; text-align: center">
          <img src="@/assets/imgs/商品.png" alt="" style="width: 60px; height: 60px">
        </div>
        <div style="flex: 1; font-size: 20px">
          <div style="margin-bottom: 5px">商品总数</div>
          <div style="font-weight: bold">{{ data.count.tourismCount || 0 }}</div>
        </div>
      </div>
      <div class="card item">
        <div style="flex: 1; text-align: center">
          <img src="@/assets/imgs/订单.png" alt="" style="width: 60px; height: 60px">
        </div>
        <div style="flex: 1; font-size: 20px">
          <div style="margin-bottom: 5px">用户预约数量</div>
          <div style="font-weight: bold">{{ data.count.reservationCount || 0 }}</div>
        </div>
      </div>
    </div>

    <div style="margin: 15px 0; display: flex; align-items: center; grid-gap: 15px">
      <div style="flex: 1; padding: 20px" class="card">
        <div id="line" style="height: 450px"></div>
      </div>
      <div style="flex: 1; padding: 20px" class="card">
        <div id="line1" style="height: 450px"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, nextTick } from "vue";
import request from "@/utils/request.js";
import * as echarts from 'echarts'

const lineOption = {
  title: { text: '预约单数趋势图', subtext: '近7天', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { left: 'left' },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: { interval: 0 }
  },
  yAxis: {
    type: 'value',
    min: 0,
    splitNumber: 5
  },
  series: [{ data: [], type: 'line', smooth: true, name: '预约数' }]
}

const lineOption1 = {
  title: { text: '游记发布数量趋势图', subtext: '近7天', left: 'center' },
  tooltip: { trigger: 'axis' },
  legend: { left: 'left' },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: { interval: 0 }
  },
  yAxis: {
    type: 'value',
    min: 0,
    splitNumber: 5
  },
  series: [{ data: [], type: 'line', smooth: true, name: '游记数' }]
}

const data = reactive({
  user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
  count: {
    travelsCount: 0,
    articleCount: 0,
    tourismCount: 0,
    ordersCount: 0,
    reservationCount: 0
  }
})

function drawReservationChart() {
  request.get('/reservation/reservationData').then(res => {
    if ((res.code === '200' || res.code === 200) && res.data) {
      const xData = res.data.map(item => item.name)
      const yData = res.data.map(item => item.value)

      lineOption.xAxis.data = xData
      lineOption.series[0].data = yData

      nextTick(() => {
        const el = document.getElementById('line')
        if (el) {
          const chart = echarts.getInstanceByDom(el) || echarts.init(el)
          chart.setOption(lineOption)
        }
      })
    }
  })
}

function drawTravelChart() {
  console.log('开始执行 drawTravelChart()')
  request.get('/travelsData').then(res => {
    console.log('/travelsData 接口返回:', res)
    if ((res.code === '200' || res.code === 200) && res.data) {
      console.log('游记数据:', res.data)
      const xData = res.data.map(item => item.name)
      const yData = res.data.map(item => item.value)
      console.log('xData:', xData)
      console.log('yData:', yData)

      lineOption1.xAxis.data = xData
      lineOption1.series[0].data = yData

      nextTick(() => {
        const el = document.getElementById('line1')
        console.log('line1 元素:', el)
        if (el) {
          const chart = echarts.getInstanceByDom(el) || echarts.init(el)
          console.log('ECharts 实例:', chart)
          chart.setOption(lineOption1)
          console.log('游记图表设置完成')
        } else {
          console.log('line1 元素不存在')
        }
      })
    } else {
      console.log('游记数据请求失败或无数据:', res)
    }
  }).catch(err => {
    console.error('游记数据请求错误:', err)
  })
}

onMounted(() => {
  request.get('/count').then(res => {
    console.log('/count 接口返回:', res)
    if ((res.code === '200' || res.code === 200) && res.data) {
      data.count = { ...data.count, ...res.data }
      console.log('更新后的 data.count:', data.count)
    }
  })

  drawReservationChart()
  drawTravelChart()
})
</script>

<style scoped>
.item {flex: 1; display: flex; align-items: center;}
.card {padding: 15px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);}
</style>


