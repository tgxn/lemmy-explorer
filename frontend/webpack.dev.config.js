const webpack = require("webpack");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    host: "0.0.0.0",
    port: 9191,
    client: {
      overlay: true,
    },
    static: {
      watch: false,
    },
    hot: true,
    liveReload: true,
    historyApiFallback: { index: "/", disableDotRule: true },
  },
  optimization: {
    // Instruct webpack not to obfuscate the resulting code
    minimize: false,
    // Enable chunk splitting in development so lazily loaded routes are fetched on demand.
    splitChunks: {
      chunks: "all",
    },
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),
  ],
});
