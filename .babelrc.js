module.exports = {
  plugins: [
    'transform-async-to-generator',
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          components: './src/components',
        },
      },
    ],
  ],
};
