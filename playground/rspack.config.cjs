const process = require('node:process')
const rspack = require('@rspack/core')
const glsl = require('unplugin-glsl/webpack').default

const isDev = process.env.NODE_ENV === 'development'
/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  mode: isDev ? 'development' : 'production',
  context: __dirname,
  entry: {
    main: './main.ts',
  },
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
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new rspack.ProgressPlugin({}),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),

    glsl({ /* options */ }),
  ],
}
