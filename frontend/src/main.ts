import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { pinia } from './stores';
import { router } from './router';
import { i18n } from './i18n';
import { useThemeStore } from './stores/theme';
import { useSettingsStore } from './stores/settings';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);

// 初始化主題
const themeStore = useThemeStore();
themeStore.initTheme();

// 初始化設置
const settingsStore = useSettingsStore();
settingsStore.initSettings();

// 自動檢測離線服務（異步，不阻塞應用啟動）
void settingsStore.autoDetectServices();

app.mount('#app');
