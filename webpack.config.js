const path = require("path");

module.exports = {
  target: "node",
  entry: "src/index.ts",
  devtool: "source-map",
  context: __dirname,
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    pathinfo: true,
    libraryTarget: "umd",
    devtoolModuleFilenameTemplate: "webpack-tabby-clippy:///[resource-path]",
  },
  resolve: {
    modules: [".", "src", "node_modules"].map((x) => path.join(__dirname, x)),
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: path.resolve(__dirname, "tsconfig.json"),
        },
      },
      {
        test: /\.scss$/,
        use: ["@tabby-gang/to-string-loader", "css-loader", "sass-loader"],
      },
      { test: /\.pug$/, use: ["apply-loader", "@webdiscus/pug-loader"] },
    ],
  },
  externals: ["fs", /^@angular/, /^tabby-/],
};
