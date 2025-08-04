const mongoose = require('mongoose');
const { shopModel } = require('../database/Login');

// 连接数据库
mongoose.connect('mongodb+srv://335846526:ysk123456@cluster0.ko0b4ty.mongodb.net/Database')
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

// 创建测试商品数据
async function createTestShopData() {
  try {
    // 清空现有商品数据
    await shopModel.deleteMany({});
    console.log('清空现有商品数据');

    // 创建测试商品
    const testProducts = [
      {
        name: '时尚T恤',
        img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        price: 99.00,
        color: ['白色', '黑色', '蓝色'],
        size: ['S', 'M', 'L', 'XL'],
        description: '舒适透气的纯棉T恤，适合日常穿着',
        category: 'clothing'
      },
      {
        name: '运动鞋',
        img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        price: 299.00,
        color: ['白色', '黑色'],
        size: ['36', '37', '38', '39', '40', '41', '42'],
        description: '轻便舒适的运动鞋，适合运动和日常穿着',
        category: 'shoes'
      },
      {
        name: '时尚背包',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        price: 199.00,
        color: ['黑色', '棕色'],
        size: ['标准'],
        description: '实用美观的背包，适合学生和上班族',
        category: 'accessories'
      },
      {
        name: '牛仔裤',
        img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        price: 159.00,
        color: ['蓝色', '黑色'],
        size: ['28', '29', '30', '31', '32', '33', '34'],
        description: '经典款牛仔裤，百搭时尚',
        category: 'clothing'
      },
      {
        name: '手表',
        img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
        price: 599.00,
        color: ['银色', '金色'],
        size: ['标准'],
        description: '精致时尚的手表，彰显品味',
        category: 'accessories'
      },
      {
        name: '休闲鞋',
        img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
        price: 199.00,
        color: ['白色', '灰色'],
        size: ['36', '37', '38', '39', '40', '41', '42'],
        description: '舒适休闲鞋，适合日常穿着',
        category: 'shoes'
      }
    ];

    // 保存商品数据
    for (const product of testProducts) {
      const newProduct = new shopModel(product);
      await newProduct.save();
      console.log(`商品 "${product.name}" 创建成功`);
    }

    console.log('所有测试商品数据创建完成');

  } catch (error) {
    console.error('创建测试商品数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestShopData(); 