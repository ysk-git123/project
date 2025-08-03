const axios = require('axios');

const BASE_URL = 'http://localhost:3001/YJL/api';

// 测试数据
const testLocation = {
  lng: 116.397428,
  lat: 39.90923,
  accuracy: 10
};

async function testLocationAPI() {
  console.log('🧪 开始测试定位功能...\n');

  try {
    // 测试1: 发送位置数据
    console.log('1. 测试发送位置数据...');
    const sendResponse = await axios.post(`${BASE_URL}/location`, testLocation);
    console.log('✅ 发送位置数据成功:', sendResponse.data);
    console.log('');

    // 测试2: 获取位置历史
    console.log('2. 测试获取位置历史...');
    const historyResponse = await axios.get(`${BASE_URL}/location/history`);
    console.log('✅ 获取位置历史成功:', historyResponse.data);
    console.log('');

    // 测试3: 获取最新位置
    console.log('3. 测试获取最新位置...');
    const latestResponse = await axios.get(`${BASE_URL}/location/latest`);
    console.log('✅ 获取最新位置成功:', latestResponse.data);
    console.log('');

    // 测试4: 清除位置历史
    console.log('4. 测试清除位置历史...');
    const clearResponse = await axios.delete(`${BASE_URL}/location/history`);
    console.log('✅ 清除位置历史成功:', clearResponse.data);
    console.log('');

    console.log('🎉 所有测试通过！定位功能正常工作。');
    console.log('');
    console.log('📝 测试总结:');
    console.log('- ✅ 位置数据发送');
    console.log('- ✅ 位置历史查询');
    console.log('- ✅ 最新位置获取');
    console.log('- ✅ 位置历史清除');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 提示: 请确保后端服务已启动 (npm start in project-node)');
    } else if (error.response) {
      console.error('服务器响应:', error.response.data);
    }
  }
}

// 检查服务是否可用
async function checkServerHealth() {
  try {
    console.log('🔍 检查服务器状态...');
    const response = await axios.get('http://localhost:3001/YJL/health');
    console.log('✅ 服务器运行正常:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 服务器不可用:', error.message);
    console.log('');
    console.log('💡 启动服务器:');
    console.log('1. cd project-node');
    console.log('2. npm start');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 定位功能测试工具');
  console.log('=====================\n');

  const serverOk = await checkServerHealth();
  if (!serverOk) {
    return;
  }

  console.log('');
  await testLocationAPI();
}

// 运行测试
main().catch(console.error); 