const mongoose = require('./database.js');



const userSchema = mongoose.Schema({            // 用户表
  username: String,         // 用户名
  password: String,          // 密码
  status: {                  // 状态   0/1
    type: Number,
    default: 0
  },
  image: String,            // 头像
  phone: String,           // 手机号
  create_time: {            // 创建时间
    type: Date,
    default: Date.now
  }
})
const userModel = mongoose.model('user', userSchema, 'user')

// 导出所有模型
module.exports = { userModel };