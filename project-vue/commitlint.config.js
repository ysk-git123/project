module.exports = {
  // 继承 Angular 规范（最常用的规范）
  extends: ['@commitlint/config-conventional'],
};

// module.exports = {
//   extends: ['@commitlint/config-conventional'],
//   rules: {
//     // 自定义允许的提交类型
//     'type-enum': [
//       2, // 错误级别：2 表示必须符合（1 是警告，0 是关闭）
//       'always',
//       ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert', 'wip']
//       // 新增 'wip' 类型（表示工作中）
//     ],
//     // 允许 subject 首字母大写（默认不允许）
//     'subject-case': [0]
//   }
// };
