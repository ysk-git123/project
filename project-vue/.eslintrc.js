module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    'vue/setup-compiler-macros': true,
  },
  // Vue CLI项目需用vue-eslint-parser作为顶层解析器
  parser: 'vue-eslint-parser',
  parserOptions: {
    // 根据文件类型自动切换解析器（关键调整）
    parser: {
      // .js/.vue文件用@babel/eslint-parser（Vue CLI默认）
      js: '@babel/eslint-parser',
      // .ts/.tsx文件用@typescript-eslint/parser
      ts: '@typescript-eslint/parser',
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // Vue3推荐规则
    'plugin:@typescript-eslint/recommended', // TypeScript推荐规则
    'plugin:prettier/recommended', // 整合Prettier（最后加载，覆盖冲突规则）
  ],
  plugins: [
    '@typescript-eslint', // 显式声明TypeScript插件
  ],
  rules: {
    // 自定义规则（根据需求调整）
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'warn', // Vue组件名建议多单词
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 允许_开头的未使用变量
    '@typescript-eslint/no-require-imports': 'off', // 允许使用require导入
    'vue/valid-define-props': 'off',
    'vue/valid-define-emits': 'off',
  },
};
