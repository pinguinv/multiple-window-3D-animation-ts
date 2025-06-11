const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/main.ts",
    // mode: "none",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".ts", ".js"],
        preferRelative: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [
                    path.resolve(__dirname, "src", "serverDev.ts"),
                    path.resolve(__dirname, "src", "serverProd.ts"),
                    /node_modules/,
                ],
                use: ["ts-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
            inject: "body",
        }),
    ],
};
