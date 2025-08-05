# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) and update the config:

```js
// eslint.config.js
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config({
  // other rules...
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
})
```

## 🗺️ 地图功能 (后端API集成)

### 功能特性
- ✅ **后端API集成** - 地图功能通过后端API调用高德地图服务
- ✅ **位置存储** - 位置数据存储在后端，支持历史记录
- ✅ **地理编码** - 地址转坐标功能
- ✅ **逆地理编码** - 坐标转地址功能
- ✅ **离线降级** - API失败时自动降级到离线地址解析

### 启动说明

#### 1. 启动后端服务
```bash
cd project-node
npm install
npm start
```
后端服务启动在 `http://localhost:3000`

#### 2. 启动前端应用
```bash
cd project
npm install
npm run dev
```
前端应用启动在 `http://localhost:5173`

#### 3. 测试地图功能
- 访问 `/map-test` 页面进行地图API测试
- 测试功能包括：
  - 获取当前位置 (浏览器定位)
  - 位置存储到后端
  - 从后端获取位置历史
  - 地理编码 (地址→坐标)
  - 逆地理编码 (坐标→地址)

### API端点

#### 位置相关
- `POST /YJL/api/location` - 存储位置数据
- `GET /YJL/api/location/latest` - 获取最新位置
- `GET /YJL/api/location/history` - 获取位置历史
- `DELETE /YJL/api/location/history` - 清除位置历史

#### 地理编码
- `POST /YJL/api/reverse-geocode` - 逆地理编码 (坐标→地址)
- `POST /YJL/api/geocode` - 地理编码 (地址→坐标)

### 技术架构
- **前端**: React + TypeScript + Ant Design
- **后端**: Node.js + Express + MongoDB
- **地图服务**: 高德地图API (服务端调用)
- **降级方案**: 离线地址解析

### 高德地图API Key
项目使用您提供的高德地图API Key:
- Web服务Key: `284cf2c61352c1e151c799fb26765f1b`
- Web端Key: `4e35bd27c62dfd31aa15194a579a09c3`

所有地图API调用都通过后端服务进行，前端不直接调用高德地图API，提高了安全性和可控性。
