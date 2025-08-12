import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>项目导航</h1>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <a href="/map" style={{ color: '#646cff', textDecoration: 'none' }}>
            🗺️ 地图功能
          </a>
          <a href="/shopping" style={{ color: '#646cff', textDecoration: 'none' }}>
            🛒 购物页面
          </a>
          <a href="/myorder" style={{ color: '#646cff', textDecoration: 'none' }}>
            📋 我的订单
          </a>
          <a href="/pendingPayment" style={{ color: '#646cff', textDecoration: 'none' }}>
            💰 待付款
          </a>
          <a href="/login" style={{ color: '#646cff', textDecoration: 'none' }}>
            🔐 登录页面
          </a>
        </div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to reload
        </p>
      </div>
      <p className="read-the-docs">
        🗝️ 高德地图API Key已更新，现在可以使用地图功能
      </p>
    </>
  )
}

export default App
