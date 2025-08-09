var express = require("express");
var {
  LoginApp,
  AuthorityApp,
  ContextApp,
  ListApp,
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
    console.log("username: " + username, "password: " + password);
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
    }
  } catch (error) {
    return res.send({
      code: 500,
      msg: "服务器错误",
      error: error.message,
    });
  }
});

// 提交用户角色信息LoginApp
router.post("/addlogin", async (req, res, next) => {
  try {
    const { user, pass, relo } = req.body;
    console.log("user: " + user, "pass: " + pass, "relo: " + relo);
    // 检查必要参数
    if (!user || !pass) {
      return res.send({
        code: 400,
        msg: "用户名和密码不能为空",
      });
    }

    // 检查用户是否已存在
    const existingUser = await LoginApp.findOne({ username: user });
    if (existingUser) {
      return res.send({
        code: 400,
        msg: "该用户已存在",
      });
    }

    // 创建新用户
    await LoginApp.create({ username: user, pass: pass });
    return res.send({
      code: 200,
      msg: "注册成功",
    });
  } catch (error) {
    return res.send({
      code: 500,
      msg: "服务器错误",
      error: error.message,
    });
  }
});

// 提交用户角色信息AuthorityApp
router.post(
  "/addauthority",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      const { username, Authoritys, merchantCode } = req.body;
      console.log(
        "username: " + username,
        "Authoritys: " + Authoritys,
        "merchantCode: " + merchantCode
      );
    } catch (error) {
      return res.send({
        code: 500,
        msg: "服务器错误",
        error: error.message,
      });
    }
  }
);

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
      // 查询与商家编号匹配的Context数据
      const contextData = await ContextApp.find({
        sjMerchantCode: merchantCode,
      });
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

router.get(
  "/list",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      const merchantCode = req.merchantCode;
      // console.log("商家编号", merchantCode);
      const listData = await ListApp.find({ Merchant: merchantCode });
      // console.log("商家产品", listData);
      return res.json({
        code: 200,
        msg: "查询成功",
        data: listData,
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

// 获取当前用户的角色信息
router.get(
  "/roleList",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      const query = {
        ...req.query,
        merchantCode: req.merchantCode || req.query.merchantCode,
      };
      const roleData = await AuthorityApp.find(query);
      // console.log(roleData);
      return res.json({
        code: 200,
        msg: "查询成功",
        data: roleData,
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

// 添加角色
router.post(
  "/roleAdd",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      const { merchantCode, userAM, Authoritys } = req.body;
      console.log(merchantCode, userAM, Authoritys);
      return res.json({
        code: 200,
        msg: "添加成功",
      });
    } catch (err) {
      return res.status(500).json({
        code: 500,
        msg: "服务器错误",
        error: err.message,
      });
    }
  }
);

// 删除角色
router.post(
  "/roleDelete",
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res, next) => {
    try {
      const { id, merchantCode } = req.query;
      console.log(id, merchantCode);
      return res.json({
        code: 200,
        msg: "删除成功",
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

// 渲染LoginApp
router.get("/getLoginApp", async (req, res) => {
  const data = await LoginApp.find();
  return res.send({
    code: 200,
    msg: "查询成功",
    data,
  });
});
router.post(
  '/getAddRole',
  verifyAccessToken,
  dataIsolationMiddleware,
  async (req, res) => {
    try {
      const { merchantCode, userAM, Authoritys, username } = req.body;

      // 检查必要参数
      if (!merchantCode || !userAM || !Authoritys || !username) {
        return res.send({
          code: 400,
          msg: '缺少必要参数',
        });
      }

      // 检查该商家的用户是否已经有权限记录
      const existingAuthority = await AuthorityApp.findOne({
        merchantCode: merchantCode,
        userAM: userAM,
      });

      if (existingAuthority) {
        return res.send({
          code: 400,
          msg: '该用户已有权限，不能再设置其它的权限',
        });
      }

      // 创建新的权限记录
      await AuthorityApp.create({
        userAM,
        username,
        Authoritys,
        merchantCode,
      });

      return res.send({
        code: 200,
        msg: '提交成功',
      });
    } catch (error) {
      console.error('添加权限失败:', error);
      return res.send({
        code: 500,
        msg: '服务器错误',
        error: error.message,
      });
    }
  }
);

module.exports = router;
