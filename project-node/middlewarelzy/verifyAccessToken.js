const jwt = require("jsonwebtoken");
const authConfig = require("./authConfig");

// 验证访问令牌的中间件
function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      msg: "未提供访问令牌",
    });
  }
  jwt.verify(token, authConfig.secrets.accessToken, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        msg: "访问令牌无效或已过期",
      });
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyAccessToken;
