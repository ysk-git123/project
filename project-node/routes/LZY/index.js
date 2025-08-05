var express = require("express");
var {
  LoginApp,
  AuthorityApp,
  ContextApp,
  ListApp
} = require("../../database/managementApp/AuthorityList");
var router = express.Router();
// 导入数据隔离中间件
const dataIsolationMiddleware = require("../../middlewarelzy/dataIsolation");
// 导入认证组件
const {
  generateTokens,
  refreshTokenController,
} = require("../../middlewarelzy/auth");
const verifyAccessToken = require("../../middlewarelzy/verifyAccessToken");

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
      // console.log(authority);
      const merchantCode = authority?.merchantCode || "default_merchant";
      const { accessToken, refreshToken } = generateTokens(user, merchantCode);
      // console.log("accessToken: ", accessToken, "refreshToken: ", refreshToken);
      return res.send({
        code: 200,
        msg: "登录成功",
        data: {
          username: user.username,
          role: authority ? authority.Authoritys : "无角色权限",
          userId: user._id,
          merchantCode: authority.merchantCode,
          accessToken: accessToken,
          refreshToken: refreshToken,
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

// 刷新令牌接口
router.post("/refreshToken", refreshTokenController);
// 需要认证的路由
router.get(
  "/protected",
  verifyAccessToken,
  refreshTokenController,
  (req, res) => {
    res.json({
      code: 200,
      msg: "受保护的路由",
      data: { user: req.user, merchantCode: req.merchantCode },
    });
  }
);

// 获取当前数据的Context数据路由
router.get(
  "/context",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      // 从请求对象中获取商家编号
      const merchantCode = req.merchantCode;
      // console.log('刘振言',merchantCode);
      // 查询与商家编号匹配的Context数据
      const contextData = await ContextApp.find({ sjMerchantCode: merchantCode });
      // console.log(contextData);
      return res.json({
        code: 200,
        msg: "查询成功",
        data: contextData,
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        msg: "服务器错误",
        error: error.message,
      });
    }
  }
);

router.get("/list", verifyAccessToken, dataIsolationMiddleware, async (req, res, next) => {
  try {
    const merchantCode = req.merchantCode;
    // console.log('商家编号',merchantCode);
    const listData = await ListApp.find({ Merchant: merchantCode });
    // console.log('商家产品',listData);
    return res.json({
      code:200,
      msg: "查询成功",
      data: listData,
    })
  } catch (error) {
    return res.status(500).json({
      code: 500,
      msg: "服务器错误",
      error: error.message,
    })
  }
})

module.exports = router;
