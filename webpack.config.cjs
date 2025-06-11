const path = require("path");

const { NODE_ENV = "production" } = process.env;

module.exports = {
    entry: "./src/serverProd.ts",
    mode: NODE_ENV,
    target: "node",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "index.cjs",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [path.resolve(__dirname, "src", "serverDev.ts")],
                use: ["ts-loader"],
            },
        ],
    },
};
