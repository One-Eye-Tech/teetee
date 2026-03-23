# Mock 数据设置说明

## 当前状态

✅ 已创建完整的 Mock 数据层
✅ 已配置环境变量使用 Mock 数据
✅ 已添加调试日志

## 如何启用 Mock 数据

### 1. 确认环境变量

`.env.development` 文件中应该有：

```env
VITE_USE_MOCK=true
```

### 2. 重启开发服务器

**重要：修改 .env 文件后必须重启开发服务器！**

在终端中：

1. 停止当前运行的开发服务器（Ctrl+C 或 Cmd+C）
2. 重新启动：

```bash
cd app-web
npm run dev
```

### 3. 验证 Mock 数据是否生效

打开浏览器控制台（F12），你应该看到：

```
=== 应用配置 ===
USE_MOCK: true
API_BASE_URL: http://192.168.1.63:8080/api
IS_DEV: true
IS_PROD: false
VITE_USE_MOCK env: true
================
```

当加载作品列表时，你应该看到：

```
[worksApi] 使用 Mock 数据获取作品列表
```

### 4. 查看 Mock 数据

打开首页，你应该能看到 12 个示例作品，包括：
- 夏日回忆
- 城市印象
- 自然风光
- 抽象艺术
- 复古风格
- 极简主义
- 梦幻星空
- 都市夜景
- 海洋之心
- 森林物语
- 科技未来
- 童话世界

## 故障排查

### 问题：控制台显示 USE_MOCK: false

**解决方案：**
1. 检查 `.env.development` 文件中 `VITE_USE_MOCK=true`
2. 确保没有拼写错误
3. 重启开发服务器

### 问题：仍然尝试连接后端

**解决方案：**
1. 清除浏览器缓存
2. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）
3. 检查控制台是否有错误信息

### 问题：看不到作品列表

**解决方案：**
1. 打开浏览器控制台查看错误
2. 检查是否有 JavaScript 错误
3. 确认 Mock 数据文件存在：`src/mocks/works.ts`

## Mock 数据文件位置

```
app-web/src/mocks/
├── works.ts          # 作品数据
├── users.ts          # 用户数据
├── orders.ts         # 订单数据
├── addresses.ts      # 地址数据
├── likes.ts          # 点赞数据
└── styles.ts         # 款式、颜色、尺码数据
```

## 切换回真实后端

如果需要切换回真实后端：

1. 修改 `.env.development`：

```env
VITE_USE_MOCK=false
```

2. 重启开发服务器
3. 确保后端服务正在运行

## 测试功能

在 Mock 模式下，以下功能都可以正常使用：

✅ 浏览作品列表
✅ 查看作品详情
✅ 点赞作品（数据存储在 localStorage）
✅ 用户登录/注册（验证码会在控制台输出）
✅ 发布作品（数据存储在内存中）
✅ 创建订单（数据存储在 localStorage）
✅ 管理地址（数据存储在 localStorage）

## 注意事项

1. Mock 数据存储在浏览器的 localStorage 中
2. 清除浏览器数据会丢失所有 Mock 数据
3. 验证码会在浏览器控制台输出，方便测试
4. 图片使用 Base64 格式存储
