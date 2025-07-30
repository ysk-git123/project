const mongoose = require('./database.js');



const userSchema = mongoose.Schema({            // 用户表
  username: String,         // 用户名
  password: String,          // 密码
  status: {                  // 状态   0/1
    type: Number,
    default: 0
  },
  role_id: {                 // 角色id
    type: mongoose.Schema.Types.ObjectId,
    ref: 'role'
  }
})
const userModel = mongoose.model('user', userSchema, 'user')


const roleSchema = mongoose.Schema({          // 角色表
  rolename: String,         // 角色名称
  description: String,      // 描述
  status: {                 // 状态
    type: Number,
    default: 0
  },
  permissions: [{           // 权限数组
    type: String,
    required: true
  }]
})

const roleModel = mongoose.model('role', roleSchema, 'role')


const menuSchema = mongoose.Schema({
  menuname: String,          // 菜单名称
  path: String,              // 前端路由
  icon: String,              // 图标
  p_id: {                    // 父级ID
    type: String,
    default: '/'
  },           
})
const menuModel = mongoose.model('menu',menuSchema,'menu')

// 导出所有模型
module.exports = {
  userModel,
  roleModel,
  menuModel
};