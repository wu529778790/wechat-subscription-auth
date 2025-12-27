import requests
import time
import subprocess
import os
import signal

# 启动服务器
os.chdir('.output/server')
server = subprocess.Popen(['node', 'index.mjs'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env={**os.environ, 'PORT': '3004'})
time.sleep(2)

# 发送测试消息
xml = '<xml><ToUserName>gh_test</ToUserName><FromUserName>oTestUser</FromUserName><CreateTime>1234567890</CreateTime><MsgType>text</MsgType><Content>验证码</Content></xml>'

try:
    response = requests.post(
        'http://localhost:3004/api/wechat/message',
        data=xml.encode('utf-8'),
        headers={'Content-Type': 'application/xml; charset=utf-8'}
    )
    print('响应:', response.text)
except Exception as e:
    print('错误:', e)
finally:
    server.terminate()
    server.wait()
