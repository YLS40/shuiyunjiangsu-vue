<template>
  <el-dialog
    v-model="visible"
    title="AI 旅游咨询客服"
    width="650px"
    :before-close="handleBeforeClose"
    top="10vh"
  >
    <div class="chat-window" ref="chatRef">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-item"
        :class="msg.role"
      >
        <div class="chat-bubble">{{ msg.content }}</div>
      </div>
      <div v-if="loading" class="loading">AI 正在思考...</div>
    </div>

    <template #footer>
      <div class="input-area">
        <el-input
          v-model="input"
          placeholder="输入问题咨询旅游团/行程/景点..."
          @keyup.enter="send"
          style="flex: 1"
        />
        <el-button type="primary" @click="send" style="margin-left: 10px">
          发送
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const chatRef = ref(null)
const messages = ref([
  { role: 'assistant', content: '你好！我是水韵江苏旅游 AI 客服，有任何旅游团预约问题都可以问我~' }
])
const input = ref('')
const loading = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  })
}

// 发送消息到 AI 接口
const send = async () => {
  if (!input.value.trim()) return

  const msg = input.value.trim()
  messages.value.push({ role: 'user', content: msg })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 前端直连通义千问（也可以换成你使用的任意大模型）
    const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-你的APIKey', // 替换成你自己的 Key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            { role: 'system', content: '你是水韵江苏旅游网 AI 客服，只回答旅游、预约、行程、景点、价格相关问题，语气友好，简洁专业。' },
            { role: 'user', content: msg }
          ]
        }
      })
    })

    const data = await res.json()
    const reply = data?.output?.choices?.[0]?.message?.content || '我暂时无法回答，请换个问题~'

    messages.value.push({ role: 'assistant', content: reply })
  } catch (e) {
    ElMessage.error('AI 服务异常，请稍后重试')
    messages.value.push({ role: 'assistant', content: '抱歉，暂时无法连接 AI 服务。' })
  }

  loading.value = false
  scrollToBottom()
}

const handleBeforeClose = () => {
  emit('update:visible', false)
}

watch(() => props.visible, (v) => {
  if (v) scrollToBottom()
})
</script>

<style scoped>
.chat-window {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
  margin-bottom: 12px;
  display: flex;
}

.chat-item.user {
  justify-content: flex-end;
}

.chat-item.assistant {
  justify-content: flex-start;
}

.chat-bubble {
  padding: 10px 15px;
  border-radius: 12px;
  max-width: 75%;
  line-height: 1.5;
}

.user .chat-bubble {
  background: #00c48c;
  color: #fff;
}

.assistant .chat-bubble {
  background: #f5f5f5;
  color: #333;
}

.input-area {
  display: flex;
  align-items: center;
}

.loading {
  text-align: center;
  color: #999;
  padding: 5px;
}
</style>