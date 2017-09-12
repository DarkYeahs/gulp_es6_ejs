module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true
  },
  // add your custom rules here
  'rules': {
    'import/no-unresolved': 0,
    'new-cap': 0,
    'no-shadow': 0,
    'camelcase': 0,
    'no-fallthrough': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'build' ? 2 : 0,
    'no-console': 0,
    'no-unused-vars': [2, {'args': 'none'}],
    'semi': [2, 'never'],
    'object-curly-spacing': [2, 'never'],
    'comma-dangle': [2, 'never'],
    'no-unused-expressions': [2, {'allowShortCircuit': true, 'allowTernary': true}],
    'prefer-const': 0,
    'prefer-template': 0,
    'prefer-arrow-callback': 0,
    'max-len': [0, 120],
    'space-before-function-paren': [2, {'anonymous': 'ignore', 'named': 'always' }],
    'object-shorthand': [2, 'always', { 'avoidQuotes': true }],
    'no-param-reassign': [2, { "props": false }],
    'global-require': 0,
    'brace-style': [2, 'stroustrup', {'allowSingleLine': true }],
    'arrow-body-style': [0, 'always'],
    'func-names': [2, 'never'],
    'default-case': 0,
    'no-underscore-dangle': 0,
    'linebreak-style': ["error", "windows"],
    'no-tabs': 0,
    //  tab代码缩进以及switch缩进限制
    'indent': ["error", "tab", { "SwitchCase": 1 }]
  }
}
