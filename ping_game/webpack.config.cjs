const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

// const settings = require(path.resolve(appDirectory, 'src/utils/constant.js'));
module.exports = {
    cache: {
    type: 'filesystem', // Stores cache on disk for faster restarts
    },
    entry: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
    output: {
        filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            template: path.resolve(appDirectory, "public/index.html"),
        })
    ],
    mode: "development",
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000, // Check for changes every second (use if usePolling doesn't work alone)
        ignored: /node_modules/,
    },
};