const path = require('path');

module.exports = {
  chainWebpack: (config) => {
    config.resolve.set('extensions', ['.js', '.ts', '.vue', '.json']).set('alias', {
      '@': path.resolve(__dirname, 'src'),
    });

    // 正确配置Vue特性标志 - 使用tap方法修改现有的DefinePlugin
    config.plugin('define').tap((args) => {
      // 确保args[0]存在
      if (!args[0]) {
        args[0] = {};
      }

      // 设置Vue 3特性标志
      args[0]['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'] = JSON.stringify(false);
      args[0]['__VUE_PROD_DEVTOOLS__'] = JSON.stringify(false);
      args[0]['__VUE_OPTIONS_API__'] = JSON.stringify(true);
      args[0]['__VUE_PROD_TIPS__'] = JSON.stringify(false);
      args[0]['__VUE_PROD_HYDRATION_MISMATCH__'] = JSON.stringify(false);

      return args;
    });
  },

  // 环境变量配置
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',

  // 生产环境配置
  productionSourceMap: false,

  // 开发环境配置
  devServer: {
    hot: true,
    open: true,
    proxy: {
      '/upload': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/YSK': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/LZY': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
