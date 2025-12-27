#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests
import time

# 测试服务器地址
BASE_URL = "http://localhost:3000"  # 或你的 Vercel 地址

def test_message(content, description):
    """测试消息发送"""
    xml = f'''<xml>
<ToUserName>gh_test</ToUserName>
<FromUserName>oTestUser</FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType>text</MsgType>
<Content>{content}</Content>
</xml>'''

    print(f"\n{'='*50}")
    print(f"测试：{description}")
    print(f"发送内容：{content}")
    print(f"{'='*50}")

    try:
        response = requests.post(
            f"{BASE_URL}/api/wechat/message",
            data=xml.encode('utf-8'),
            headers={'Content-Type': 'application/xml; charset=utf-8'},
            timeout=5
        )

        print(f"状态码：{response.status_code}")
        print(f"响应：\n{response.text}")

        # 检查是否包含验证码
        if '验证码' in response.text or '认证码' in response.text:
            print("✅ 成功：返回了验证码")
        else:
            print("❌ 失败：未返回验证码")

    except Exception as e:
        print(f"错误：{e}")

def test_subscribe_event():
    """测试关注事件"""
    xml = '''<xml>
<ToUserName>gh_test</ToUserName>
<FromUserName>oTestUser</FromUserName>
<CreateTime>1234567890</CreateTime>
<MsgType>event</MsgType>
<Event>subscribe</Event>
</xml>'''

    print(f"\n{'='*50}")
    print(f"测试：用户关注事件")
    print(f"{'='*50}")

    try:
        response = requests.post(
            f"{BASE_URL}/api/wechat/message",
            data=xml.encode('utf-8'),
            headers={'Content-Type': 'application/xml; charset=utf-8'},
            timeout=5
        )

        print(f"状态码：{response.status_code}")
        print(f"响应：\n{response.text}")

    except Exception as e:
        print(f"错误：{e}")

if __name__ == "__main__":
    print("微信公众号消息测试工具")
    print("=" * 50)
    print(f"测试服务器：{BASE_URL}")
    print("=" * 50)

    # 测试关注事件
    test_subscribe_event()

    # 测试各种关键词
    test_message("验证码", "发送'验证码'")
    test_message("已关注", "发送'已关注'")
    test_message("认证", "发送'认证'")
    test_message("验证", "发送'验证'")
    test_message("login", "发送'login'")
    test_message("测试", "发送无关内容")

    print("\n" + "="*50)
    print("测试完成！")
    print("="*50)
