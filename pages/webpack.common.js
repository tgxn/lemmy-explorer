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
      title: "Lemmy Explorer - Data Access",
      template: "index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
          },
        },
      },
      // load markdown as file
      {
        test: /\.md$/,
        use: "file-loader",
      },
    ],
  },
};
