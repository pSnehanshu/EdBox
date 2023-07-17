module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "module:metro-react-native-babel-preset"],
    plugins: [
      "transform-inline-environment-variables",
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ],
  };
};
