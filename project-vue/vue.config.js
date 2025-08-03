const path = require('path');
module.exports = {
  chainWebpack: (config) => {
    config.resolve.set('extensions', ['.js', '.ts', '.vue', '.json']).set('alias', {
      '@': path.resolve(__dirname, 'src'),
    });
  },
};
