const mongoose = require('./database.js');


const LoginSchema = mongoose.Schema({       // 登录表
  username: String,           // 用户名
  password: String,           // 密码   
  status: {
    type: Number,
    default: 0                 // 状态 0 禁用 1 正常
  },
  user_id: [{                 // 用户id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }]
});

const LoginModel = mongoose.model('Login', LoginSchema)

module.exports = LoginModel;