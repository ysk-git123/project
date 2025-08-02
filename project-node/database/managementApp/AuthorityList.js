const mongoose = require('../database.js');

const Login = new mongoose.Schema({
    username: String, // 用户名
    pass: Number, //密码
});
const LoginApp = mongoose.model('Loginlist', Login, 'Loginlist');

const Authority = new mongoose.Schema({
    username: String, // 用户名
    Authoritys: String, //权限
    merchantCode: String, //商户号
    userAM: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loginlist',
        required: true
    }, //用户id
})
const AuthorityApp = mongoose.model('Authoritylist', Authority, 'Authoritylist');

module.exports = {
    LoginApp,
    AuthorityApp
};
