const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glsl = require('unplugin-glsl/webpack').default

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: './main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: 'index.html',
    }),

    // require('unplugin-glsl/webpack')({ /* options */ }),
    glsl({ /* options */ }),
  ],
  module: {
    rules: [
      {
        oneOf: [
          {
            resourceQuery: /raw/,
            type: 'asset/source',
          },
        ],
      },
    ],
  },

  devServer: {
    devMiddleware: {
      index: true,
      mimeTypes: { 'text/html': ['phtml'] },
      serverSideRender: true,
      writeToDisk: true,
    },
  },
}
