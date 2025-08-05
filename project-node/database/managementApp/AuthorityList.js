const mongoose = require('../database.js');

// 用户
const Login = new mongoose.Schema({
    username: String, // 用户名
    pass: Number, //密码
});
const LoginApp = mongoose.model('Loginlist', Login, 'Loginlist');

// 用户权限
const Authority = new mongoose.Schema({
    username: String, // 用户名
    Authoritys: String, //权限
    merchantCode: {
        type: String,
        required: true,
        index: true
    }, //商户号
    userAM: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loginlist',
        required: true
    }, //用户id
})
const AuthorityApp = mongoose.model('Authoritylist', Authority, 'Authoritylist');

// 商家首页信息
const Context = new mongoose.Schema({
    name:String,
    sjMerchantCode: String,
    sell:String
})
const ContextApp = mongoose.model('Contextlist', Context, 'Contextlist');

const List = new mongoose.Schema({
    title:String, //物品名称
    price:Number, //价格
    flag:{
        type:Boolean,
        default: false
    }, //上下架
    Merchant:String
})
const ListApp = mongoose.model('Listlist', List, 'Listlist');

module.exports = {
    LoginApp,
    AuthorityApp,
    ContextApp,
    ListApp
};
