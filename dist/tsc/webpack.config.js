"use strict";
const path = require('path');
module.exports = {
    entry: './src/manager.ts',
    mode: "production",
    target: "web",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'client.min.js',
        path: path.resolve(__dirname, 'dist/web'),
    },
};
