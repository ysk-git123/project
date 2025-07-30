const mongoose = require('./database.js');


const LoginSchema = mongoose.Schema({       // 登录表
  username: String,           // 用户名
  password: String,           // 密码   
  status: {
    type: Number,
    default: 0                 // 状态 0 正常 1 禁用
  },
  user_id: [{                 // 用户id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }]
});

const LoginModel = mongoose.model('Login', LoginSchema)


const userSchema = mongoose.Schema({       // 用户表
  username: String,           // 用户名
  description: String,        // 描述
  status: {
    type: Number,
    default: 0                // 状态 0 正常 1 禁用
  },
  rele_id: [{                // 角色id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rele'
  }]
});

const userModel = mongoose.model('user', userSchema)


const releSchema = mongoose.Schema({       // 角色表
  name: String,               // 角色名
  description: String,        // 描述
  create_time: {              // 创建时间
    type: Date,
    default: Date.now
  },
  update_time: {              // 更新时间
    type: Date,
    default: Date.now
  },
  status: {                    // 状态 0 禁用 1 正常
    type: Number,
    default: 0
  }
});

const releModel = mongoose.model('rele', releSchema)

module.exports = {
  LoginModel,
  userModel,
  releModel
}