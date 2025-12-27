<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <h1 class="text-2xl font-bold">🔐 完成认证</h1>
          <p class="text-blue-100 text-sm mt-1">关注公众号，发送关键词获取认证码</p>
        </div>

        <!-- 二维码区域 -->
        <div class="p-6 border-b">
          <div class="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300 text-center">
            <div class="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border-2 border-green-500">
              <span class="text-4xl">📷</span>
            </div>
            <p class="text-gray-600 text-sm">请在此处放置你的订阅号二维码</p>
            <p class="text-gray-400 text-xs mt-1">（修改 pages/auth.vue 添加图片）</p>
          </div>
        </div>

        <!-- 操作步骤 -->
        <div class="p-6 border-b">
          <h3 class="font-bold text-gray-800 mb-3">📋 操作步骤</h3>
          <div class="space-y-2">
            <div class="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <strong class="block text-gray-800">关注公众号</strong>
                <span class="text-sm text-gray-600">微信扫码关注</span>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <strong class="block text-gray-800">发送关键词</strong>
                <span class="text-sm text-gray-600">输入"已关注"或"认证"</span>
              </div>
            </div>
            <div class="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <strong class="block text-gray-800">获取认证码</strong>
                <span class="text-sm text-gray-600">公众号回复6位数字</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 认证操作区 -->
        <div class="p-6">
          <div class="space-y-4">
            <!-- 主按钮 -->
            <button
              @click="checkAuth"
              :disabled="checking"
              class="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition shadow-lg"
            >
              <span v-if="checking">🔍 检查中...</span>
              <span v-else>✅ 我已关注，立即认证</span>
            </button>

            <!-- 状态提示 -->
            <div
              v-if="message"
              :class="[
                'p-3 rounded-lg text-sm text-center animate-fade-in',
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                message.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              ]"
            >
              {{ message.text }}
            </div>

            <!-- 手动输入认证码 -->
            <div v-if="showTokenInput" class="bg-gray-50 rounded-lg p-4">
              <div class="flex gap-2 mb-2">
                <input
                  v-model="token"
                  placeholder="输入6位认证码"
                  maxlength="6"
                  @keyup.enter="verifyToken"
                  class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:border-blue-500"
                />
                <button
                  @click="verifyToken"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
                >
                  验证
                </button>
              </div>
              <p class="text-xs text-gray-500 text-center">认证码5分钟内有效</p>
            </div>
          </div>
        </div>

        <!-- 返回链接 -->
        <div class="bg-gray-50 p-4 text-center border-t">
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← 返回首页
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const checking = ref(false);
const token = ref('');
const showTokenInput = ref(false);
const message = ref<{ type: string; text: string } | null>(null);
const isPolling = ref(false);
let pollInterval: NodeJS.Timeout | null = null;

// 页面挂载时自动开始轮询
onMounted(() => {
  startAutoPolling();
});

// 页面卸载时清理
onUnmounted(() => {
  stopAutoPolling();
});

// 自动轮询检查认证状态
const startAutoPolling = () => {
  if (pollInterval) return;

  isPolling.value = true;
  console.log('[AutoPoll] 开始自动轮询');

  // 立即检查一次
  checkAuth(true);

  // 每3秒检查一次
  pollInterval = setInterval(() => {
    if (!checking.value) {
      checkAuth(true);
    }
  }, 3000);

  // 5分钟后停止轮询
  setTimeout(() => {
    stopAutoPolling();
    if (!message.value || message.value.type !== 'success') {
      message.value = {
        type: 'info',
        text: '自动检测已结束，您可以手动点击按钮检查或输入认证码'
      };
      showTokenInput.value = true;
    }
  }, 5 * 60 * 1000);
};

// 停止自动轮询
const stopAutoPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    isPolling.value = false;
    console.log('[AutoPoll] 停止自动轮询');
  }
};

// 检查认证状态（支持自动轮询和手动检查）
const checkAuth = async (isAuto = false) => {
  if (!isAuto) {
    checking.value = true;
    message.value = null;
  }

  try {
    // 尝试从cookie获取openid
    const cookie = document.cookie.split('; ').find(row => row.startsWith('wxauth-openid='));
    let openid = null;

    if (cookie) {
      openid = cookie.split('=')[1];
    }

    // 调用API检查认证状态
    const result = await $fetch('/api/auth/check', {
      query: { openid }
    });

    if (result.authenticated) {
      // 停止轮询
      stopAutoPolling();

      // 设置session
      await setSession(result.user);

      // 保存openid到cookie（30天有效期）
      if (result.user.openid) {
        document.cookie = `wxauth-openid=${result.user.openid}; max-age=${30 * 24 * 60 * 60}; path=/; sameSite=lax`;
      }

      message.value = { type: 'success', text: '✅ 认证成功！正在跳转...' };
      setTimeout(() => navigateTo('/'), 1000);
    } else {
      if (!isAuto) {
        message.value = {
          type: 'warning',
          text: '尚未检测到认证消息，请发送"已关注"到公众号，或手动输入认证码'
        };
        showTokenInput.value = true;
      } else {
        // 自动轮询时，显示友好的提示
        if (!message.value) {
          message.value = {
            type: 'info',
            text: isPolling.value ? '⏳ 自动检测中... 请发送"已关注"到公众号' : '等待认证中...'
          };
        }
      }
    }
  } catch (error) {
    if (!isAuto) {
      console.error('Check auth error:', error);
      message.value = { type: 'error', text: '❌ 认证失败，请重试' };
      showTokenInput.value = true;
    }
  } finally {
    if (!isAuto) {
      checking.value = false;
    }
  }
};

// 验证认证码
const verifyToken = async () => {
  if (!token.value || token.value.length !== 6) {
    message.value = { type: 'error', text: '请输入6位认证码' };
    return;
  }

  try {
    const result = await $fetch('/api/auth/check', {
      query: { authToken: token.value }
    });

    if (result.authenticated) {
      // 停止轮询
      stopAutoPolling();

      // 设置session
      await setSession(result.user);

      // 保存openid到cookie
      if (result.user.openid) {
        document.cookie = `wxauth-openid=${result.user.openid}; max-age=${30 * 24 * 60 * 60}; path=/; sameSite=lax`;
      }

      message.value = { type: 'success', text: '✅ 认证成功！正在跳转...' };
      setTimeout(() => navigateTo('/'), 1000);
    } else {
      const errorMsg = result.error === 'invalid_or_expired'
        ? '❌ 认证码已过期，请重新获取'
        : '❌ 认证码无效，请检查或重新获取';
      message.value = { type: 'error', text: errorMsg };
    }
  } catch (error) {
    console.error('Verify token error:', error);
    message.value = { type: 'error', text: '❌ 验证失败，请重试' };
  }
};

// 设置session
const setSession = async (user: any) => {
  await $fetch('/api/auth/session', {
    method: 'POST',
    body: { user }
  });
};

// 手动刷新检查（保留给用户主动操作）
const manualCheck = async () => {
  stopAutoPolling();
  await checkAuth(false);
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
</style>
