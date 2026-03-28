<template>
  <div class="login-container">
    <div class="login-box">
      <div style="font-weight: bold; font-size: 24px; text-align: center; margin-bottom: 30px; color: #147300">欢 迎 登 录</div>
      <el-form ref="formRef" :model="data.form" :rules="data.rules">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" size="large" v-model="data.form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input show-password :prefix-icon="Lock" size="large" v-model="data.form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%" @click="login">登 录</el-button>
        </el-form-item>
        <div style="display: flex">
          <a style="color: #1967e3; margin-right: 15px" href="/front/home">游客访问</a>
          <a style="color: #1967e3;" href="/adminLogin">管理员登录</a>
          <div style="flex: 1; text-align: right">还没有账号？请 <a style="color: #189500" href="/register">注册</a></div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import { ElMessage } from "element-plus";
import router from "@/router/index.js";

const data = reactive({
  form: {
    username: '',
    password: '',
    role: 'USER'
  },
  rules: {
    username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  }
})

const formRef = ref()

const login = () => {
  formRef.value.validate(valid => {
    if (valid) {
      request.post('/login', data.form).then(res => {
        console.log("登录返回数据：", res);

        // ✅ 修复1：判断字符串 '200'，和后端保持一致
        if (res.code === '200') {
          // ✅ 修复2：强制显示绿色「登录成功」，覆盖后端 msg
          ElMessage.success('登录成功');
          localStorage.setItem('xm-user', JSON.stringify(res.data));

          // ✅ 修复3：延迟跳转，确保一定生效
          setTimeout(() => {
            if (res.data.role === 'ADMIN' || res.data.role === 'admin') {
              router.push('/admin/home');
            } else {
              router.push('/front/home');
            }
          }, 500);
        } else {
          ElMessage.error(res.msg);
        }
      }).catch(err => {
        ElMessage.error('登录失败：网络异常');
        console.error(err);
      });
    }
  });
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("@/assets/imgs/bg.jpg");
  background-size: 100% 100%;
}
.login-box {
  width: 350px;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.5);
}
</style>