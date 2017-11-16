var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/agate-front/default/apps/admin/admin.jsx',
    output: {
        path: __dirname + '/src/agate-front/default/', filename: 'admin-bundle.js'
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};