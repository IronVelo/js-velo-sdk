const path = require('path');

module.exports = {
    entry: './lib/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'velo-sdk.js',
        library: 'VeloSDK',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    optimization: {
        usedExports: true,
    },
    target: 'web'
};