<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 class="text-xl font-bold text-gray-700">正在检查认证状态...</h2>
      </div>

      <!-- 已登录 -->
      <div v-else-if="session?.authenticated" class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-6">
          <div class="text-5xl mb-2">✅</div>
          <h2 class="text-2xl font-bold text-gray-800">认证成功！</h2>
          <p class="text-gray-600 mt-2">欢迎访问，您已完成公众号认证</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">用户ID</span>
            <span class="font-mono font-semibold">{{ session.user.openid.substring(0, 8) }}...</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">认证时间</span>
            <span>{{ formatTime(session.user.authenticatedAt) }}</span>
          </div>
          <div v-if="session.user.nickname" class="flex justify-between">
            <span class="text-gray-500">昵称</span>
            <span>{{ session.user.nickname }}</span>
          </div>
        </div>

        <button
          @click="logout"
          class="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
        >
          退出登录
        </button>
      </div>

      <!-- 未登录 -->
      <div v-else class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-6">
          <div class="text-5xl mb-2">📱</div>
          <h2 class="text-2xl font-bold text-gray-800">需要认证</h2>
          <p class="text-gray-600 mt-2">请关注公众号并完成认证流程</p>
        </div>

        <div class="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span class="text-sm text-gray-700">扫码关注公众号</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span class="text-sm text-gray-700">发送关键词 <span class="font-semibold">"已关注"</span></span>
          </div>
          <div class="flex items-start gap-3">
            <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span class="text-sm text-gray-700">获取6位认证码</span>
          </div>
        </div>

        <NuxtLink
          to="/auth"
          class="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-center transition"
        >
          前往认证页面
        </NuxtLink>
      </div>

      <!-- 说明 -->
      <div class="mt-4 bg-white/90 backdrop-blur rounded-xl p-4 text-sm text-gray-700">
        <h3 class="font-semibold mb-2">💡 使用说明</h3>
        <ul class="list-disc list-inside space-y-1 opacity-80">
          <li>本系统通过微信订阅号进行用户认证</li>
          <li>关注公众号后发送关键词获取认证码</li>
          <li>认证成功后可访问受保护的内容</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // 优先检查 session
    const sessionResult = await $fetch('/api/auth/session');
    if (sessionResult.authenticated) {
      session.value = sessionResult;
      loading.value = false;
      return;
    }

    // 检查 cookie 中的 openid
    const cookie = document.cookie.split('; ').find(row => row.startsWith('wxauth-openid='));
    if (cookie) {
      const openid = cookie.split('=')[1];
      const result = await $fetch('/api/auth/check', { query: { openid } });
      if (result.authenticated) {
        session.value = result;
      }
    }
  } catch (error) {
    console.error('Session check error:', error);
  } finally {
    loading.value = false;
  }
});

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const logout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await $fetch('/api/auth/session', { method: 'DELETE' });
    document.cookie = 'wxauth-openid=; Max-Age=0; path=/';
    location.reload();
  }
};
</script>
