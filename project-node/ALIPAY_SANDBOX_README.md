# 支付宝沙箱支付集成说明

## 🎉 功能完成情况

✅ **后端API已完成**
- 支付订单创建接口: `GET /YJL/zf`
- 用户信息查询接口: `GET /YJL/user/info/:username`
- 订单状态查询接口: `GET /YJL/order/status/:orderNo`
- 支付成功回调: `GET /YJL/payment/success`
- 支付异步通知: `POST /YJL/payment/notify`

✅ **前端组件已完成**
- React支付组件: `Payment.tsx`
- 响应式样式: `Payment.css`
- 路由集成: `/payment`

✅ **数据库模型**
- 用户模型: 存储用户名和VIP状态
- 订单模型: 存储支付订单信息

## 🚀 使用方法

### 1. 访问支付页面
```
http://localhost:3001/payment
```

### 2. 测试支付流程
1. 输入用户名（例如：test_user_001）
2. 选择支付金额（推荐使用 ¥0.01 测试）
3. 点击"立即支付"按钮
4. 在新窗口中完成支付宝沙箱支付
5. 支付完成后自动开通VIP会员

### 3. API接口测试
```bash
# 创建支付订单
curl "http://localhost:3000/YJL/zf?username=test_user&amount=0.01"

# 查询用户信息
curl "http://localhost:3000/YJL/user/info/test_user"

# 健康检查
curl "http://localhost:3000/YJL/health"
```

## 🔧 支付宝沙箱配置

### 当前配置信息
- **应用ID**: 2021000147673017
- **环境**: 沙箱环境
- **网关**: https://openapi-sandbox.dl.alipaydev.com/gateway.do

### 沙箱买家账号（用于测试支付）
```
账号: jyjbmj8509@sandbox.com
登录密码: 111111
支付密码: 111111
```

### 沙箱卖家账号（商户账号）
```
账号: ihazpg1763@sandbox.com
登录密码: 111111
```

## 💡 测试建议

### 1. 小额测试
- 使用 ¥0.01 进行功能测试
- 确保支付流程完整

### 2. 功能验证
- ✅ 订单创建成功
- ✅ 支付页面正常打开
- ✅ 支付完成后VIP状态更新
- ✅ 回调处理正确

### 3. 错误处理测试
- 无效用户名
- 网络异常
- 支付取消

## 📊 数据库结构

### 用户表 (users)
```javascript
{
  username: String,     // 用户名
  isvip: String,       // VIP状态 ('true'/'false')
  createdAt: Date,     // 创建时间
  updatedAt: Date      // 更新时间
}
```

### 订单表 (orders)
```javascript
{
  orderNo: String,        // 订单号
  username: String,       // 用户名
  amount: String,         // 支付金额
  status: String,         // 订单状态 (pending/success/failed)
  alipayTradeNo: String,  // 支付宝交易号
  createdAt: Date,        // 创建时间
  updatedAt: Date         // 更新时间
}
```

## 🔒 安全说明

### 沙箱环境
- 当前配置为支付宝沙箱环境
- 仅用于开发和测试
- 不会产生真实资金流动

### 生产环境部署
1. 更换为正式环境网关
2. 使用正式应用ID和密钥
3. 配置正确的回调域名
4. 添加服务器IP白名单

## 🛠️ 故障排除

### 常见问题
1. **支付页面打开失败**
   - 检查后端服务是否启动
   - 确认网络连接正常

2. **回调处理失败**
   - 检查回调URL配置
   - 验证签名算法

3. **VIP状态未更新**
   - 检查数据库连接
   - 确认异步通知处理

### 调试方法
- 查看浏览器开发者工具
- 检查后端服务日志
- 使用API测试工具

## 📈 扩展功能

### 可添加的功能
1. **多种支付方式**
   - 微信支付
   - 银联支付

2. **会员等级**
   - 普通会员
   - 高级会员
   - 白金会员

3. **支付记录**
   - 支付历史查询
   - 发票管理
   - 退款处理

4. **优惠活动**
   - 优惠券系统
   - 折扣活动
   - 积分兑换

---

**注意**: 这是沙箱环境的测试配置，正式上线前需要申请正式的支付宝商户账号并更新相关配置。 