module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Legacy decorators rewrite WatermelonDB's `@text('x') x!: string` fields into
      // initialized ones; loose class properties keep the TypeScript transform from
      // rejecting that on the web/node targets, where it isn't loose by default.
      ['@babel/plugin-transform-class-properties', { loose: true }],
    ],
  };
};
