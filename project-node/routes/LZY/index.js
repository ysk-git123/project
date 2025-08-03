var express = require('express');
var router = express.Router();


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
var express = require("express");
var {
  LoginApp,
  AuthorityApp,
} = require("../../database/managementApp/AuthorityList");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({
        code: 400,
        msg: "用户名和密码不能为空",
      });
    }
    const user = await LoginApp.findOne({ username: username, pass: password });
    if (user) {
      // 查询用户角色信息
      const authority = await AuthorityApp.findOne({
        userAM: user._id,
      });
      console.log(authority);
      return res.send({
        code: 200,
        msg: "登录成功",
        data: {
          username: user.username,
        },
      });
    } else {
      return res.send({
        code: 401,
        msg: "用户名或密码错误",
      });
    }
  } catch (error) {
    return res.send({
      code: 500,
      msg: "服务器错误",
      error: error.message,
    });
  }
});

module.exports = router;
// const express = require("express");          