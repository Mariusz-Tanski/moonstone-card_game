const merge = require("webpack-merge");
const base = require("./base");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(base, {
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/client/index.html"
    })
  ]
});
