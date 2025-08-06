const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Lemmy Explorer",
      template: "index.html",
      inject: "body",
      scriptLoading: "defer",
      hash: true,
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
  ],
  optimization: {
    sideEffects: true,
    usedExports: true,
    splitChunks: {
      chunks: "all",
      minSize: 50000,
      maxSize: 150000,
      minChunks: 1,
      maxAsyncRequests: 10,
      maxInitialRequests: 3,
      // enforceSizeThreshold: 50000,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: "react",
          chunks: "all",
          priority: 30,
        },
        tanstack: {
          test: /[\\/]node_modules[\\/](@tanstack|react-query|@tanstack|react-table)[\\/]/,
          name: "tanstack",
          chunks: "all",
          priority: 20,
        },
        mui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion|tss-react)[\\/]/,
          name: "mui",
          chunks: "all",
          priority: 10,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 0,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { modules: false }],
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
};
