const { merge } = require("webpack-merge");

const prod = require("./webpack.prod.config.js");

module.exports = merge(prod, {
  output: {
    publicPath: "./",
  },
});
