const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());

// const settings = require(path.resolve(appDirectory, 'src/utils/constant.js'));
// disable hot module to prevent reload problem in front
module.exports = {
    // devServer: {
    //     hot: false,
    //     liveReload: false, // optional, disables full page reloads too
    // },
    devServer: {
    client: { webSocketURL: 'ws://localhost:8083/ws' }
    },
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
    devtool: 'source-map', // Use a standard source map
        output: {
        // This forces webpack to use absolute paths that the browser can resolve
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'
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