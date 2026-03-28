import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router/index.js";

const request = axios.create({
    baseURL: 'http://localhost:8098',
    timeout: 30000
})

request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';

    let user = JSON.parse(localStorage.getItem("xm-user") || '{}');
    let token = user.token || '';

    // 公开浏览页面
    const isPublicPage =
        config.url.includes('/travels/') ||
        config.url.includes('/routes/') ||
        config.url.includes('/tourism/') ||
        config.url.includes('/article/') ||
        config.url.includes('/notice/');

    // 操作类接口
    const isOperationPath =
        config.url.includes('/add') ||
        config.url.includes('/update') ||
        config.url.includes('/delete') ||
        config.url.includes('/praise/') ||
        config.url.includes('/collect/') ||
        config.url.includes('/reservation/') ||
        config.url.includes('/user/info') ||
        config.url.includes('/orders/') ||
        config.url.includes('/feedback/');

    // 管理员后台接口需要token
    const isAdminPath =
        config.url === '/count' ||
        config.url === '/travelsData' ||
        config.url === '/ordersData' ||
        config.url.startsWith('/admin/') ||
        config.url.startsWith('/user/');

    // 公开页面 + 操作接口 + 管理员接口 都带 token
    if ((isPublicPage || isOperationPath || isAdminPath) && token) {
        config.headers['token'] = token;
    }

    return config;
}, error => {
    return Promise.reject(error)
});

request.interceptors.response.use(
    response => {
        let res = response.data;
        if (response.config.responseType === 'blob') return res;

        if (res.code === '401') {
            const isOperationPath =
                response.config.url.includes('/add') ||
                response.config.url.includes('/update') ||
                response.config.url.includes('/delete') ||
                response.config.url.includes('/praise/') ||
                response.config.url.includes('/collect/') ||
                response.config.url.includes('/reservation/') ||
                response.config.url.includes('/user/info') ||
                response.config.url.includes('/orders/') ||
                response.config.url.includes('/feedback/');

            if (isOperationPath) {
                let user = JSON.parse(localStorage.getItem('xm-user') || '{}')
                if (!user.token) {
                    ElMessage.warning('请先登录后再进行此操作');
                    router.push('/login');
                }
            }
        }

        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res;
        }
        return res;
    },
    error => {
        console.error(error);
        return Promise.reject(error)
    }
)

export default request