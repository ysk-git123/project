var mongoose = require('./database.js')


const shopSchema = mongoose.Schema({
    name: String,                   // 商品名称 
    image: String,                    // 商品图片
    price: Number,                  // 商品价格
    color: [                         // 颜色
        {
            type: String,
        }
    ],
    size: [                         // 尺码
        {
            type: String,
        }
    ],
    description: String,             // 商品描述
    category: String,                // 商品分类
})

const shopModel = mongoose.model('shop', shopSchema, 'shop')

module.exports = {
    shopModel
}