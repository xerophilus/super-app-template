module.exports = {
  presets: [
    '@babel/preset-react',
    '@babel/preset-typescript',
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'commonjs',
      useBuiltIns: 'usage',
      corejs: 3
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    '@babel/plugin-transform-runtime'
  ],
}; 