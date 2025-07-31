// module.exports = {
//   // 继承 Angular 规范（最常用的规范）
//   extends: ['@commitlint/config-conventional'],
// };

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 自定义规则
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']],
    'subject-min-length': [2, 'always', 3], // subject 最小长度为 3
  },
};
