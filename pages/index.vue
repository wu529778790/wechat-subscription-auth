<template>
  <div class="min-h-screen bg-[#eee] flex items-center justify-center p-4">
    <!-- 已认证状态 -->
    <div
      v-if="session?.authenticated"
      class="w-full max-w-md bg-white rounded-2xl p-8 text-center animate-fade-in shadow-xl">
      <div class="text-5xl mb-3">✅</div>
      <h2 class="text-xl font-bold text-gray-800 mb-1">认证成功</h2>
      <p class="text-gray-500 mb-6 text-sm">欢迎访问</p>
      <button
        @click="logout"
        class="w-full py-3 bg-[#07C160] hover:bg-[#06AD56] text-white rounded-xl font-medium transition shadow-lg">
        退出登录
      </button>
    </div>

    <!-- 加载中 -->
    <div
      v-else-if="loading"
      class="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow-xl">
      <div
        class="w-12 h-12 border-3 border-[#07C160]/20 border-t-[#07C160] rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">加载中...</p>
    </div>

    <!-- 认证弹窗 -->
    <div
      v-else
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
      <!-- 标题栏 - 微信风格 -->
      <div class="bg-[#07C160] px-6 py-4 text-center">
        <h2 class="text-xl font-bold text-white">微信认证</h2>
      </div>

      <!-- 内容区域 -->
      <div class="p-6 space-y-5">
        <!-- 二维码区域 -->
        <div class="text-center space-y-3">
          <div
            class="w-36 h-36 mx-auto bg-white rounded-xl flex items-center justify-center border-2 border-[#07C160]/20 shadow-md">
            <img
              v-if="qrcodeUrl"
              :src="qrcodeUrl"
              alt="扫码关注"
              class="w-full h-full object-contain p-2" />
            <div v-else class="text-[#07C160] text-sm text-center">
              <div class="text-3xl mb-1">📷</div>
              二维码
            </div>
          </div>
          <p class="text-sm text-gray-600">
            微信扫码关注
            <span class="font-bold text-[#07C160]">"{{ wechatName }}"</span>
          </p>
        </div>

        <!-- 步骤说明 - 微信风格 -->
        <div
          class="bg-[#F8F8F8] rounded-xl p-4 space-y-3 border border-[#E5E5E5]">
          <div class="flex items-start gap-3">
            <span
              class="w-6 h-6 bg-[#07C160] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              >1</span
            >
            <span class="text-gray-700 text-sm leading-relaxed"
              >扫码关注公众号</span
            >
          </div>
          <div class="flex items-start gap-3">
            <span
              class="w-6 h-6 bg-[#07C160] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              >2</span
            >
            <span class="text-gray-700 text-sm leading-relaxed"
              >发送"验证码"获取数字</span
            >
          </div>
          <div class="flex items-start gap-3">
            <span
              class="w-6 h-6 bg-[#07C160] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              >3</span
            >
            <span class="text-gray-700 text-sm leading-relaxed"
              >输入完成认证</span
            >
          </div>
        </div>

        <!-- 验证码输入 -->
        <div class="space-y-4">
          <!-- 6位验证码输入格子 -->
          <div class="flex gap-3 justify-center">
            <input
              v-for="i in 6"
              :key="i"
              :ref="
                (el) => {
                  if (el) inputRefs[i - 1] = el;
                }
              "
              v-model="codeInputs[i - 1]"
              maxlength="1"
              @input="(e) => handleInput(e, i - 1)"
              @keydown="(e) => handleKeydown(e, i - 1)"
              @keyup.enter="verifyCode"
              @paste="handlePaste"
              class="w-12 h-14 sm:w-14 sm:h-16 bg-white border-2 border-[#DCDCDC] rounded-xl text-center text-2xl font-bold text-[#333] focus:outline-none focus:border-[#07C160] focus:ring-2 focus:ring-[#07C160]/20 transition-all"
              :class="{ 'border-[#07C160] bg-[#F0FDF4]': codeInputs[i - 1] }" />
          </div>

          <!-- 验证按钮 - 微信风格 -->
          <button
            @click="verifyCode"
            :disabled="isVerifying || !isCodeComplete"
            class="w-full py-4 bg-[#07C160] hover:bg-[#06AD56] disabled:bg-[#C8C8C8] disabled:text-white text-white rounded-xl font-bold text-base transition-all shadow-lg active:scale-[0.98]">
            {{ isVerifying ? "验证中..." : "验证" }}
          </button>

          <!-- 消息提示 - 微信风格 -->
          <div
            v-if="message"
            :class="[
              'px-4 py-3 rounded-xl text-sm text-center font-medium',
              message.type === 'success'
                ? 'bg-[#F0FDF4] text-[#07C160] border border-[#07C160]/20'
                : message.type === 'error'
                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20'
                : 'bg-[#F0FDF4] text-[#07C160] border border-[#07C160]/20',
            ]">
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const session = ref<any>(null);
const loading = ref(true);
const verificationCode = ref("");
const codeInputs = ref<string[]>(["", "", "", "", "", ""]);
const inputRefs = ref<any[]>([]);
const isVerifying = ref(false);
const message = ref<{ type: string; text: string } | null>(null);

const config = useRuntimeConfig();
const wechatName = ref(config.public.wechatName || "我的公众号");
const qrcodeUrl = ref(config.public.wechatQrcodeUrl || "");

// 计算属性：验证码是否完整
const isCodeComplete = computed(() => {
  return (
    codeInputs.value.every((code) => code !== "") &&
    codeInputs.value.join("").length === 6
  );
});

// 处理输入
const handleInput = (e: Event, index: number) => {
  const value = (e.target as HTMLInputElement).value;

  // 只允许数字
  if (!/^\d*$/.test(value)) {
    codeInputs.value[index] = "";
    return;
  }

  // 如果输入了内容，自动聚焦到下一个输入框
  if (value && index < 5) {
    setTimeout(() => {
      inputRefs.value[index + 1]?.focus();
    }, 10);
  }

  // 更新完整验证码
  verificationCode.value = codeInputs.value.join("");

  // 如果输入了最后一个数字且验证码完整，自动验证
  if (index === 5 && value && isCodeComplete.value) {
    setTimeout(() => {
      verifyCode();
    }, 300); // 延迟300ms，给用户一个短暂的确认时间
  }
};

// 处理键盘事件
const handleKeydown = (e: KeyboardEvent, index: number) => {
  if (e.key === "Backspace" || e.key === "Delete") {
    if (!codeInputs.value[index] && index > 0) {
      // 当前为空，删除前一个
      codeInputs.value[index - 1] = "";
      setTimeout(() => {
        inputRefs.value[index - 1]?.focus();
      }, 10);
    } else if (codeInputs.value[index]) {
      // 清空当前
      codeInputs.value[index] = "";
    }
  } else if (e.key === "ArrowLeft" && index > 0) {
    e.preventDefault();
    inputRefs.value[index - 1]?.focus();
  } else if (e.key === "ArrowRight" && index < 5) {
    e.preventDefault();
    inputRefs.value[index + 1]?.focus();
  }
};

// 处理粘贴
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pasteData = e.clipboardData?.getData("text").replace(/\D/g, "");
  if (pasteData) {
    const chars = pasteData.split("").slice(0, 6);
    chars.forEach((char, index) => {
      if (index < 6) {
        codeInputs.value[index] = char;
      }
    });
    verificationCode.value = codeInputs.value.join("");

    // 聚焦到最后一个有内容的输入框或第一个空的输入框
    const lastIndex = Math.min(chars.length - 1, 5);
    setTimeout(() => {
      inputRefs.value[lastIndex]?.focus();
    }, 10);

    // 如果粘贴的内容正好是6位数字，自动验证
    if (chars.length === 6) {
      setTimeout(() => {
        verifyCode();
      }, 500); // 延迟500ms，给用户一个确认时间
    }
  }
};

// 监听verificationCode变化，同步到codeInputs（用于外部设置）
watch(verificationCode, (newVal) => {
  if (newVal.length === 6) {
    const chars = newVal.split("");
    codeInputs.value = [...chars, ...Array(6 - chars.length).fill("")];
  }
});

// 监听session变化，当退出登录时自动聚焦
watch(session, (newSession) => {
  if (!newSession?.authenticated) {
    setTimeout(() => {
      if (inputRefs.value[0]) {
        inputRefs.value[0].focus();
      }
    }, 100);
  }
});

// 检查cookie中的openid
function getSavedOpenid(): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("wxauth-openid="));
  return cookie ? cookie.split("=")[1] : null;
}

onMounted(async () => {
  try {
    const sessionResult = await $fetch("/api/auth/session");
    if (sessionResult.authenticated) {
      session.value = sessionResult;
    } else {
      const savedOpenid = getSavedOpenid();
      if (savedOpenid) {
        const result = await $fetch("/api/auth/check", {
          query: { openid: savedOpenid },
        });
        if (result.authenticated) session.value = result;
      }
    }
  } catch (error) {
    console.error("Init error:", error);
  } finally {
    loading.value = false;
    // 页面加载完成后，自动聚焦到第一个输入框
    setTimeout(() => {
      if (!session.value?.authenticated && inputRefs.value[0]) {
        inputRefs.value[0].focus();
      }
    }, 100);
  }
});

const logout = async () => {
  if (confirm("确定退出吗？")) {
    await $fetch("/api/auth/session", { method: "DELETE" });
    document.cookie = "wxauth-openid=; Max-Age=0; path=/";
    location.reload();
  }
};

const verifyCode = async () => {
  const code = codeInputs.value.join("");

  if (!code || code.length !== 6) {
    message.value = { type: "error", text: "请输入6位验证码" };
    return;
  }

  isVerifying.value = true;
  message.value = null;

  try {
    const result = await $fetch("/api/auth/check", {
      query: { authToken: code },
    });

    if (result.authenticated) {
      session.value = result;
      message.value = { type: "success", text: "✅ 认证成功！" };

      if (result.user.openid) {
        document.cookie = `wxauth-openid=${result.user.openid}; max-age=${
          30 * 24 * 60 * 60
        }; path=/`;
      }

      await $fetch("/api/auth/session", {
        method: "POST",
        body: { user: result.user },
      });
      setTimeout(() => location.reload(), 1000);
    } else {
      message.value = {
        type: "error",
        text:
          result.error === "invalid_or_expired" ? "验证码已过期" : "验证码错误",
      };
      // 清空所有输入框
      codeInputs.value = ["", "", "", "", "", ""];
      verificationCode.value = "";
      // 聚焦到第一个输入框
      setTimeout(() => {
        if (inputRefs.value[0]) {
          inputRefs.value[0].focus();
        }
      }, 100);
    }
  } catch (error) {
    message.value = { type: "error", text: "验证失败，请重试" };
  } finally {
    isVerifying.value = false;
  }
};
</script>

<style scoped>
/* 微信风格输入框焦点样式 */
input:focus {
  border-color: #07c160 !important;
  box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.2) !important;
}

/* 按钮点击反馈 */
button:active:not(:disabled) {
  transform: scale(0.98);
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
