const webpack = require("webpack");
const { merge } = require("webpack-merge");

const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  output: {
    filename: "[name].bundle.[contenthash].js",
    chunkFilename: "[name].bundle.[contenthash].js",
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 128000,
    maxAssetSize: 0,
  },

  optimization: {
    minimize: true,
    runtimeChunk: "single",
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 50000,
      maxSize: 150000,
      minChunks: 1,
      maxAsyncRequests: 10,
      maxInitialRequests: 5,
      // enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
});
