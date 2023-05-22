const path = require("path");

module.exports = {
    entry: "./src/Index.jsx",
    output: {
        path: path.join(__dirname, "/public/js"),
        filename: "main.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            }
        ]
    }
};
