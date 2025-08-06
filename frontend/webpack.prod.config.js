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
    moduleIds: "deterministic",
    // runtimeChunk: "single",
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    // splitChunks: {
    //   chunks: "all",
    //   minSize: 50000,
    //   maxSize: 150000,
    //   minChunks: 1,
    //   maxAsyncRequests: 10,
    //   maxInitialRequests: 5,
    //   // enforceSizeThreshold: 50000,
    //   cacheGroups: {
    //     vendors: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: "vendors",
    //       chunks: "all",
    //     },
    //   },
    // },
  },
});
