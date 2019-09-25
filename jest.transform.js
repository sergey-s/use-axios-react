module.exports = require('babel-jest').createTransformer({
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  'plugins': [
    '@babel/plugin-proposal-class-properties',
    '@babel/transform-runtime'
  ]
});
