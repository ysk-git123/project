/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
module.exports = {
  // ... 其他原有配置
  chainWebpack: (config) => {
    config.resolve.set('extensions', ['.js', '.ts', '.vue', '.json']).set('alias', {
      '@': path.resolve(__dirname, 'src'),
    });
  },
};
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
