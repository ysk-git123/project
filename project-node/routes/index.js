var express = require('express');
var router = express.Router();
var { LoginModel, userModel, releModel } = require('../database/Login')
const jwt = require('jsonwebtoken')



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await LoginModel.findOne({ username })
  if (!user) {
    return res.status(401).json({ message: '用户不存在' })
  }
  if (user.password !== password) {
    return res.status(401).json({ message: '密码错误' })
  }
  const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' })
  res.json({ token })
});



module.exports = router;
