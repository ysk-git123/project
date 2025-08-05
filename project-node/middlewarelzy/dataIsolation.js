const dataIsolationMiddleware = async (req, res, next) => {
  try {
    // 假设用户信息存储在req.user中，包含merchantCode
    // 实际应用中，可能需要从token或session中获取用户信息
    const userInfo = req.user;

    if (!userInfo || !userInfo.merchantCode) {
        return res.status(403).json({
            code: 403,
            msg: "无访问权限，缺少商户标识"
        });
    }
    // 将merchantCode添加到请求对象中，供后续处理使用
    req.merchantCode = userInfo.merchantCode;
    next();
  } catch (error) {
    return res.status(500).json({
        code:500,
        msg: "数据隔离中间件错误",
        error: error.message
    })
  }
};
module.exports = dataIsolationMiddleware;
