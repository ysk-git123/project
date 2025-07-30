const mongoose = require('mongoose');
const { userModel, roleModel } = require('../database/Login');

// 连接数据库
mongoose.connect('mongodb+srv://335846526:ysk123456@cluster0.ko0b4ty.mongodb.net/Database')
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

// 创建测试数据
async function createTestData() {
  try {
    // 1. 创建角色
    const adminRole = new roleModel({
      rolename: '管理员',
      description: '系统管理员，拥有所有权限',
      status: 1,
      permissions: ['user:all', 'role:all', 'system:all']
    });

    const userRole = new roleModel({
      rolename: '普通用户',
      description: '普通用户，基础权限',
      status: 1,
      permissions: ['user:read', 'profile:update']
    });

    await adminRole.save();
    await userRole.save();
    
    console.log('角色创建成功');

    // 2. 创建用户
    const adminUser = new userModel({
      username: 'admin',
      password: '123456',
      status: 1,
      role_id: adminRole._id
    });

    const testUser = new userModel({
      username: 'testuser',
      password: '123456',
      status: 1,
      role_id: userRole._id
    });

    await adminUser.save();
    await testUser.save();
    
    console.log('用户创建成功');
    console.log('测试账号:');
    console.log('- 管理员: admin / 123456');
    console.log('- 普通用户: testuser / 123456');
    
  } catch (error) {
    console.error('创建测试数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData(); 