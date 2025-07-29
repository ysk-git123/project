const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://335846526:ysk123456@cluster0.ko0b4ty.mongodb.net/Database').then(() => {
    console.log('连接成功');

}).catch((err) => {
    console.log('连接失败');

});

module.exports = mongoose;


