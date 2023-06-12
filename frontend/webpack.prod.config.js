const webpack = require("webpack");
const { merge } = require("webpack-merge");

const TerserPlugin = require("terser-webpack-plugin");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  plugins: [new webpack.EnvironmentPlugin(["NODE_ENV"])],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // sourceMap: true, // Must be set to true if using source-maps in production
        // sourceMap: false, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            warnings: false,
            drop_console: true,
          },
        },
      }),
    ],
  },
});
