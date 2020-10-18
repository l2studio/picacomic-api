module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  extends: ['standard'],
  rules: {
    'no-unused-vars': 'warn'
  }
}
