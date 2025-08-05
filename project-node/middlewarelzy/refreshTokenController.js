const jwt = require("jsonwebtoken");
const { AuthorityApp } = require("../database/managementApp/AuthorityList");
const authConfig = require("./authConfig");
const generateTokens = require("./generateTokens");

async function refreshTokenController(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({
      code: 401,
      msg: "未提供刷新令牌",
    });
  }
  jwt.verify(
    refreshToken,
    authConfig.secrets.refreshToken,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ code: 403, msg: "刷新令牌无效或已过期" });
      }
      try {
        // 查找用户信息
        const authority = await AuthorityApp.findOne({
          userAM: decoded.userId,
          merchantCode: decoded.merchantCode,
        });
        if (!authority) {
          return res.status(404).json({ code: 404, msg: "用户不存在" });
        }
        // 生成新的令牌
        const user = { _id: decoded.userId, username: authority.username };
        const newTokens = generateTokens(user, decoded.merchantCode);

        res.status(200).json({
          code: 200,
          msg: "令牌刷新成功",
          data: newTokens,
        });
      } catch (error) {
        res.status(500).json({
          code: 500,
          msg: "服务器错误",
          error: error.message,
        });
      }
    }
  );
}

module.exports = refreshTokenController;
