#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
不使用 curl，直接用 Python 发送正确的 UTF-8 编码
"""

import requests
import time

# 测试数据
xml_content = '<xml><MsgType>text</MsgType><Content>验证码</Content><FromUserName>testuser</FromUserName><ToUserName>gh_test</ToUserName></xml>'

print("=" * 60)
print("测试：使用 Python 发送 UTF-8 编码")
print("=" * 60)

# 显示原始数据
print(f"\n1. 原始 XML:")
print(xml_content)

print(f"\n2. UTF-8 字节:")
print(f"   {xml_content.encode('utf-8').hex()}")

print(f"\n3. 发送请求到诊断接口...")

try:
    response = requests.post(
        'https://auth.shenzjd.com/api/wechat/diagnostic',
        data=xml_content.encode('utf-8'),
        headers={'Content-Type': 'application/xml; charset=utf-8'},
        timeout=10
    )

    print(f"\n4. 响应状态: {response.status_code}")
    print(f"\n5. 响应内容:")
    print(response.text)

    # 解析响应
    import json
    try:
        result = response.json()
        print(f"\n6. 解析后的诊断数据:")
        print(f"   Body内容: {result.get('bodyPreview')}")
        print(f"   Body Hex: {result.get('bodyHex')}")
        print(f"   Body UTF8: {result.get('bodyUtf8')}")
    except:
        print("\n6. 无法解析 JSON 响应")

except Exception as e:
    print(f"\n错误: {e}")

print("\n" + "=" * 60)
print("现在测试消息接口...")
print("=" * 60)

try:
    response = requests.post(
        'https://auth.shenzjd.com/api/wechat/message',
        data=xml_content.encode('utf-8'),
        headers={'Content-Type': 'application/xml; charset=utf-8'},
        timeout=10
    )

    print(f"\n响应状态: {response.status_code}")
    print(f"响应内容:\n{response.text}")

except Exception as e:
    print(f"\n错误: {e}")

print("\n" + "=" * 60)
print("如果上面返回了验证码，说明问题已解决！")
print("=" * 60)
