# 前端部署到 GitHub Pages 指南

## 项目改造说明

本项目已经改造为支持纯前端静态部署模式，可以在 GitHub Pages 上独立运行，不依赖后端服务器。

### 主要改动

1. **Mock 数据层**
   - 创建了完整的 Mock 数据文件（`src/mocks/`）
   - 包含用户、作品、订单、地址、点赞等所有数据

2. **API 适配层**
   - 创建了 Mock API 实现（`src/api/mock/`）
   - 所有 API 调用都支持 Mock 模式

3. **配置管理**
   - 通过环境变量 `VITE_USE_MOCK` 控制是否使用 Mock 数据
   - 生产环境默认使用 Mock 数据
   - 开发环境可选择使用真实后端或 Mock 数据

4. **数据持久化**
   - 使用 localStorage 存储用户数据、订单、地址等
   - 图片使用 Base64 格式存储

## 部署步骤

### 1. 配置 GitHub Repository

1. 在 GitHub 上创建一个新仓库
2. 将代码推送到仓库

```bash
cd app-web
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2. 配置 GitHub Pages

1. 进入仓库的 Settings
2. 找到 Pages 选项
3. Source 选择 "GitHub Actions"

### 3. 创建 GitHub Actions 工作流

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_USE_MOCK: 'true'
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. 配置 Vite Base Path

如果你的仓库名不是 `你的用户名.github.io`，需要修改 `vite.config.ts`：

```typescript
export default defineConfig({
  base: '/你的仓库名/',  // 添加这一行
  plugins: [vue()],
  // ...其他配置
})
```

### 5. 构建和部署

```bash
# 本地测试构建
npm run build
npm run preview

# 推送到 GitHub 触发自动部署
git add .
git commit -m "Configure for GitHub Pages"
git push
```

## 本地开发

### 使用 Mock 数据开发

修改 `.env.development`：

```env
VITE_USE_MOCK=true
```

### 使用真实后端开发

修改 `.env.development`：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://你的后端地址:8080/api
```

## Mock 数据说明

### 默认用户

系统预置了几个测试用户：

- 手机号：13800138000 - 设计师小王
- 手机号：13800138001 - 创意达人
- 手机号：13800138002 - 艺术家李
- 手机号：13800138003 - 简约派

### 验证码

在 Mock 模式下，所有验证码都会在控制台输出，方便测试。

### 数据持久化

- 用户数据存储在 `localStorage` 的 `mock_current_user` 键
- 订单数据存储在 `localStorage` 的 `mock_orders` 键
- 地址数据存储在 `localStorage` 的 `mock_addresses` 键
- 点赞数据存储在 `localStorage` 的 `mock_likes` 键

清除所有数据：

```javascript
localStorage.clear()
```

## 功能支持

### 已支持的功能

✅ 用户登录/注册（Mock 验证码）
✅ 作品浏览和展示
✅ 作品点赞
✅ 作品发布
✅ 订单创建
✅ 地址管理
✅ 用户资料编辑
✅ 图片上传（Base64）

### 不支持的功能

❌ 真实支付（仅模拟）
❌ 短信验证码（仅模拟）
❌ 跨设备数据同步
❌ 服务器端图片存储

## 注意事项

1. **数据隔离**：每个浏览器的数据是独立的，清除浏览器数据会丢失所有内容
2. **图片大小**：由于使用 Base64 存储，建议上传的图片不要太大（< 2MB）
3. **浏览器兼容性**：需要支持 localStorage 和 ES6+ 的现代浏览器
4. **HTTPS**：GitHub Pages 自动提供 HTTPS，某些功能（如相机）需要 HTTPS 环境

## 故障排查

### 构建失败

检查 Node.js 版本是否 >= 18：

```bash
node --version
```

### 页面空白

1. 检查浏览器控制台错误
2. 确认 `vite.config.ts` 中的 `base` 配置正确
3. 清除浏览器缓存

### Mock 数据不生效

1. 检查 `.env.production` 中 `VITE_USE_MOCK=true`
2. 重新构建项目
3. 检查浏览器控制台是否有 "[API Router] 使用 Mock 数据模式" 日志

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- Axios
- LocalStorage API

## 许可证

MIT
