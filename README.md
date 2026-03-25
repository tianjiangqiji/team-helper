# ChatGPT Team 邀请助手

基于激活码的ChatGPT Team邀请管理系统，支持自动邀请、支付集成、库存管理等功能。

## 项目简介

本项目是一个完整的ChatGPT Team邀请管理解决方案，通过激活码系统管理用户邀请，支持易支付集成、多母号配置、自动邀请等功能。

## 核心功能

- 🎫 **激活码管理系统** - 生成、绑定、解绑、换绑激活码
- 👥 **自动Team邀请** - 用户通过激活码自动发送Team邀请
- 💰 **易支付集成** - 支持支付宝、微信支付等多种支付方式
- 📦 **库存管理** - 自动管理激活码库存，支持批量导入
- 🔧 **管理后台** - 完整的后台管理界面，支持订单、激活码、母号管理
- 🔄 **多母号配置** - 支持配置多个母号，自动切换和负载均衡
- 📊 **统计分析** - 实时统计邀请数据、订单数据、库存数据
- 🔒 **安全可靠** - 支持频率限制、并发控制、订单超时清理

## 截图展示

### 用户页面
![用户首页](image/用户首页.png)
![用户激活页面](image/用户激活页面.png)
![购买页面](image/购买页面.png)

### 管理后台
![激活码管理](image/激活码管理.png)
![库存管理](image/库存管理.png)
此处的一件粘贴使用'tools/Team管理系统配套的脚本.js'获取母号Token（油猴或脚本猫安装）
![添加母号](image/添加母号.png)
![脚本](image/脚本.png)
![系统设置](image/系统设置.png)
![系统日志](image/系统日志.png)

## 技术栈

- **后端框架:** Flask
- **数据库:** SQLite
- **缓存:** Redis
- **任务调度:** APScheduler
- **支付集成:** 易支付

## 环境要求

- Python 3.8+
- Redis 6.0+
- 支持HTTPS的服务器（用于支付回调）

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/tianjiangqiji/team-helper.git
```
cd team-helper
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

**⚠️ 重要：首次部署必须修改以下配置**

```bash
# 设置管理员密码（首次进入后后会存入数据库，此处就可以删除了）
ADMIN_PASSWORD=your-secure-password

# 设置 Flask 随机加密密钥
SECRET_KEY=your-random-secret-key

# 配置Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # 如果有密码

# 配置易支付（可选，部署后在管理后台配置支付方式也可以，如果填入首次进入后后会存入数据库，此处就可以删除了）
EPAY_MERCHANT_ID=your-merchant-id
EPAY_API_KEY=your-api-key
EPAY_NOTIFY_URL=https://your-domain.com/api/pay/notify
EPAY_RETURN_URL=https://your-domain.com/buy
EPAY_GATEWAY_URL=https://your-epay-gateway.com/submit.php
EPAY_PRODUCT_PRICE=1.00
```

### 4. 启动Redis

```bash
redis-server
```

### 5. 运行程序

```bash
python main.py
```

程序默认运行在 `http://localhost:39001`

## 使用说明

### 管理后台

1. 访问 `http://localhost:39001/admin/`
2. 使用配置的管理员密码登录
3. 配置母号信息（Token和Account ID）
4. 生成激活码或导入库存激活码

### 用户使用

1. 访问 `http://localhost:39001`
2. 输入激活码和邮箱进行绑定
3. 点击发送邀请按钮
4. 查收邮箱中的Team邀请

### 支付购买

1. 访问 `http://localhost:39001/buy`
2. 选择支付方式并完成支付
3. 支付成功后自动获得激活码

## 配置说明

### 代理配置（可选）

如果需要通过代理访问ChatGPT：

```bash
# HTTP代理
HTTP_PROXY=http://proxy-server:port
HTTPS_PROXY=http://proxy-server:port

# SOCKS5代理
SOCKS5_PROXY=socks5://user:pass@proxy-server:port
```

### 订单配置

```bash
# 订单超时时间（秒），默认30分钟
ORDER_TIMEOUT=1800

# 订单清理间隔（秒），默认5分钟
ORDER_CLEANUP_INTERVAL=300
```

### 并发控制

```bash
# 最大并发邀请数
MAX_CONCURRENT_INVITES=3
```

## 目录结构

```
.
├── core/                   # 核心业务逻辑
│   ├── activation_code_service.py
│   ├── invite_service.py
│   ├── payment_service.py
│   ├── stock_service.py
│   └── ...
├── routes/                 # 路由模块
│   ├── auth.py
│   ├── user.py
│   ├── admin.py
│   └── payment.py
├── templates/              # HTML模板
├── static/                 # 静态资源
├── utils/                  # 工具函数
├── models/                 # 数据模型
├── data/                   # 数据文件（数据库、日志）
├── main.py                 # 主程序入口
├── config.py               # 配置管理
└── requirements.txt        # 依赖列表
```

## 常见问题

### 1. 如何获取母号Token和Account ID？

登录ChatGPT Team账号，打开浏览器开发者工具，在Network标签中找到API请求，从请求头中获取：
- `authorization`: Bearer Token
- `chatgpt-account-id`: Account ID

### 2. 支付回调失败怎么办？

确保：
- 服务器支持HTTPS
- 回调URL可以从外网访问
- 易支付配置正确
- 检查日志文件 `data/logs.log`

### 3. 邀请失败怎么办？

可能原因：
- 母号Token过期或失效
- 网络连接问题（检查代理配置）
- Team名额已满
- 邮箱已在其他Team中

### 4. 如何备份数据？

备份以下文件：
- `data/database.db` - 数据库文件
- `.env` - 配置文件

## 安全建议

1. ⚠️ 首次部署必须修改默认管理员密码
2. 🔒 使用强密码和随机SECRET_KEY
3. 🌐 生产环境建议使用HTTPS
4. 🔐 定期备份数据库
5. 📝 定期检查日志文件

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 致谢

本项目基于 [team-invite-kfc](https://github.com/james-6-23/team-invite-kfc) 开发。

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请通过Issue联系。
