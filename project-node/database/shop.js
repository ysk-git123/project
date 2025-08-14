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
    createTime: {                    // 创建时间
        type: Date,
        default: Date.now
    },
    // 审核相关字段
    status: {                        // 审核状态：pending(待审核), approved(已通过), rejected(已拒绝)
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    rejectReason: String,            // 拒绝原因
    auditTime: Date,                 // 审核时间
    auditor: String,                 // 审核人
    merchantCode: String,            // 商家代码
    stock: {                         // 库存数量
        type: Number,
        default: 0
    }
    
})

const shopModel = mongoose.model('shop', shopSchema, 'shop')

module.exports = {
    shopModel
}