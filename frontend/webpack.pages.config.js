const { merge } = require("webpack-merge");

const prod = require("./webpack.prod.config.js");

module.exports = merge(prod, {
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "./",
    clean: true,
  },
});
