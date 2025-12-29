/**
 * 微信订阅号认证 SDK - 极简版
 *
 * 特点：
 * - 仅需配置 apiBase
 * - 复用现有后端 API
 * - 无额外依赖
 * - 总大小 < 10KB
 *
 * 使用方法：
 *
 * 1. 引入SDK
 *    <script src="https://your-site.com/sdk/wx-auth-simple.js"></script>
 *
 * 2. 初始化
 *    WxAuth.init({
 *      apiBase: 'https://your-api.com',
 *      onVerified: (user) => { console.log('验证通过', user); }
 *    });
 *
 * 3. 使用
 *    await WxAuth.requireAuth();
 */

(function(global) {
  'use strict';

  // 默认配置
  const DEFAULT_CONFIG = {
    apiBase: '',           // 后端API地址（必填）
    onVerified: null,      // 验证成功回调
    onError: null,         // 错误回调
    wechatName: '公众号',   // 公众号名称（可选，会自动获取）
    qrcodeUrl: ''          // 二维码URL（可选，会自动获取）
  };

  let config = { ...DEFAULT_CONFIG };
  let state = {
    isOpen: false,
    resolveAuth: null,
    currentStep: 'qr'
  };

  // ==================== 工具函数 ====================

  const utils = {
    // 获取Cookie
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },

    // 设置Cookie（30天过期）
    setCookie(name, value) {
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    },

    // 删除Cookie
    deleteCookie(name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    },

    // 发送请求
    async request(url, options = {}) {
      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: options.body ? JSON.stringify(options.body) : null,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('[WxAuth] Request error:', error);
        throw error;
      }
    },

    // 生成6位验证码输入框HTML
    generateCodeInputs() {
      let html = '<div class="wx-auth-inputs">';
      for (let i = 0; i < 6; i++) {
        html += `<input type="text" maxlength="1" class="wx-auth-input" data-index="${i}" />`;
      }
      html += '</div>';
      return html;
    }
  };

  // ==================== UI 管理器 ====================

  const UI = {
    // 创建弹窗
    createModal() {
      const modal = document.createElement('div');
      modal.id = 'wx-auth-modal';
      modal.className = 'wx-auth-modal';

      modal.innerHTML = `
        <div class="wx-auth-overlay"></div>
        <div class="wx-auth-content">
          <div class="wx-auth-header">
            <div class="wx-auth-title">微信认证</div>
            <button class="wx-auth-close" onclick="WxAuth.close()">×</button>
          </div>
          <div class="wx-auth-body">
            <!-- 步骤1: 二维码 -->
            <div class="wx-auth-step wx-auth-step-qr">
              <div class="wx-auth-desc">微信扫码关注公众号</div>
              <div class="wx-auth-qrcode-container">
                <img class="wx-auth-qrcode" src="" alt="扫码关注" />
                <div class="wx-auth-placeholder">
                  <div class="wx-auth-icon">📷</div>
                  <div>二维码</div>
                </div>
              </div>
              <div class="wx-auth-hint">关注后公众号会自动发送验证码</div>
            </div>

            <!-- 步骤2: 输入验证码 -->
            <div class="wx-auth-step wx-auth-step-code" style="display:none">
              <div class="wx-auth-desc">输入6位验证码</div>
              ${utils.generateCodeInputs()}
              <div class="wx-auth-hint">在公众号发送"验证码"获取</div>
            </div>

            <!-- 步骤3: 成功 -->
            <div class="wx-auth-step wx-auth-step-success" style="display:none">
              <div class="wx-auth-success-icon">✅</div>
              <div class="wx-auth-success-text">验证成功</div>
            </div>

            <!-- 消息提示 -->
            <div class="wx-auth-message" style="display:none"></div>

            <!-- 按钮 -->
            <div class="wx-auth-actions">
              <button class="wx-auth-btn wx-auth-btn-primary" onclick="WxAuth.verifyCode()">验证</button>
              <button class="wx-auth-btn wx-auth-btn-secondary" onclick="WxAuth.switchToCodeInput()">手动输入</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.bindInputEvents();
      return modal;
    },

    // 绑定输入事件
    bindInputEvents() {
      setTimeout(() => {
        const inputs = document.querySelectorAll('.wx-auth-input');
        if (!inputs.length) return;

        inputs.forEach((input, index) => {
          // 输入事件
          input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;

            if (value && index < 5) {
              inputs[index + 1].focus();
            }

            // 自动验证
            if (index === 5 && value) {
              setTimeout(() => WxAuth.verifyCode(), 300);
            }
          });

          // 键盘事件
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
              inputs[index - 1].focus();
            } else if (e.key === 'ArrowLeft' && index > 0) {
              e.preventDefault();
              inputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < 5) {
              e.preventDefault();
              inputs[index + 1].focus();
            }
          });

          // 粘贴事件
          input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (paste) {
              paste.split('').forEach((char, i) => {
                if (inputs[i]) inputs[i].value = char;
              });
              if (paste.length === 6) {
                setTimeout(() => WxAuth.verifyCode(), 300);
              }
            }
          });
        });
      }, 100);
    },

    // 显示弹窗
    show() {
      let modal = document.getElementById('wx-auth-modal');
      if (!modal) {
        modal = this.createModal();
      }
      modal.style.display = 'flex';
      state.isOpen = true;
    },

    // 隐藏弹窗
    hide() {
      const modal = document.getElementById('wx-auth-modal');
      if (modal) {
        modal.style.display = 'none';
        state.isOpen = false;
      }
    },

    // 显示步骤
    showStep(step) {
      state.currentStep = step;
      const steps = ['qr', 'code', 'success'];
      steps.forEach(s => {
        const el = document.querySelector(`.wx-auth-step-${s}`);
        if (el) el.style.display = s === step ? 'block' : 'none';
      });

      // 按钮显示逻辑
      const actions = document.querySelector('.wx-auth-actions');
      if (actions) {
        if (step === 'qr') {
          actions.style.display = 'flex';
          actions.querySelectorAll('button').forEach(b => b.style.display = 'inline-block');
        } else if (step === 'code') {
          actions.style.display = 'flex';
          const btns = actions.querySelectorAll('button');
          btns[0].style.display = 'inline-block';
          btns[1].style.display = 'none';
        } else {
          actions.style.display = 'none';
        }
      }
    },

    // 设置二维码
    setQrCode(url) {
      if (!url) return;
      const img = document.querySelector('.wx-auth-qrcode');
      const placeholder = document.querySelector('.wx-auth-placeholder');
      if (img) {
        img.src = url;
        img.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      }
    },

    // 显示消息
    showMessage(text, type = 'info') {
      const msg = document.querySelector('.wx-auth-message');
      if (msg) {
        msg.textContent = text;
        msg.className = `wx-auth-message wx-auth-message-${type}`;
        msg.style.display = 'block';

        setTimeout(() => {
          if (msg.textContent === text) {
            msg.style.display = 'none';
          }
        }, 3000);
      }
    },

    // 获取验证码
    getVerifyCode() {
      const inputs = document.querySelectorAll('.wx-auth-input');
      if (!inputs.length) return '';
      return Array.from(inputs).map(i => i.value).join('');
    },

    // 清空验证码输入
    clearCodeInputs() {
      const inputs = document.querySelectorAll('.wx-auth-input');
      inputs.forEach(i => i.value = '');
      if (inputs[0]) inputs[0].focus();
    }
  };

  // ==================== 核心 API ====================

  const WxAuth = {
    // 初始化
    init(options = {}) {
      config = { ...DEFAULT_CONFIG, ...options };

      if (!config.apiBase) {
        console.error('[WxAuth] apiBase is required');
        return;
      }

      console.log('[WxAuth] SDK initialized', config);
    },

    // 主入口：需要验证时调用
    async requireAuth() {
      // 1. 检查本地Cookie
      const openid = utils.getCookie('wxauth-openid');
      if (openid) {
        try {
          const result = await utils.request(
            `${config.apiBase}/api/auth/check?openid=${openid}`
          );
          if (result.authenticated) {
            console.log('[WxAuth] 已认证（Cookie）');
            this.onVerified(result.user);
            return true;
          }
        } catch (e) {
          console.error('[WxAuth] Cookie check failed:', e);
        }
      }

      // 2. 显示弹窗
      UI.show();

      // 3. 获取配置（公众号名称、二维码）
      try {
        // 尝试获取配置（如果后端有 /api/sdk/config）
        try {
          const cfg = await utils.request(`${config.apiBase}/api/sdk/config`);
          if (cfg.wechatName) config.wechatName = cfg.wechatName;
          if (cfg.qrcodeUrl) config.qrcodeUrl = cfg.qrcodeUrl;
        } catch (e) {
          // 使用默认配置
        }

        // 显示二维码
        if (config.qrcodeUrl) {
          UI.setQrCode(config.qrcodeUrl);
        }

        // 更新描述文字
        const desc = document.querySelector('.wx-auth-desc');
        if (desc) {
          desc.textContent = `微信扫码关注 "${config.wechatName}"`;
        }

        UI.showStep('qr');
        UI.showMessage('请扫码关注公众号', 'info');

      } catch (error) {
        UI.showMessage('加载失败，请重试', 'error');
        return false;
      }

      // 返回Promise，等待验证完成
      return new Promise((resolve) => {
        state.resolveAuth = resolve;
      });
    },

    // 切换到验证码输入
    switchToCodeInput() {
      UI.showStep('code');
      UI.showMessage('请输入6位验证码', 'info');

      setTimeout(() => {
        const firstInput = document.querySelector('.wx-auth-input');
        if (firstInput) firstInput.focus();
      }, 100);
    },

    // 验证验证码
    async verifyCode() {
      const code = UI.getVerifyCode();

      if (!code || code.length !== 6) {
        UI.showMessage('请输入6位验证码', 'error');
        return;
      }

      UI.showMessage('验证中...', 'info');

      try {
        const result = await utils.request(
          `${config.apiBase}/api/auth/check?authToken=${code}`
        );

        if (result.authenticated) {
          // 验证成功
          UI.showStep('success');
          UI.showMessage('验证成功！', 'success');

          // 保存到Cookie
          if (result.user && result.user.openid) {
            utils.setCookie('wxauth-openid', result.user.openid);
          }

          // 延迟关闭
          setTimeout(() => {
            this.close();
            this.onVerified(result.user);
          }, 1500);

        } else {
          UI.showMessage('验证码错误或已过期', 'error');
          UI.clearCodeInputs();
        }
      } catch (error) {
        UI.showMessage('验证失败，请重试', 'error');
      }
    },

    // 关闭弹窗
    close() {
      UI.hide();
      if (state.resolveAuth) {
        state.resolveAuth(false);
        state.resolveAuth = null;
      }
    },

    // 验证成功回调
    onVerified(user) {
      console.log('[WxAuth] 验证成功', user);
      if (typeof config.onVerified === 'function') {
        config.onVerified(user);
      }
      if (state.resolveAuth) {
        state.resolveAuth(true);
        state.resolveAuth = null;
      }
    },

    // 错误回调
    onError(error) {
      console.error('[WxAuth] 错误', error);
      if (typeof config.onError === 'function') {
        config.onError(error);
      }
    }
  };

  // 暴露到全局
  global.WxAuth = WxAuth;

})(window);
