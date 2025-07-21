const path = require('path');
const yargs = require('yargs');
const webpack = require('webpack');
const config = require('@bedrockio/config');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { template: compileTemplate } = require('lodash');

// To enable multiple builds, place each app in a folder inside src,
// add it below, and move src/index.html to src/common/index.html.
const APPS = ['public'];

// webpack v5 no longer passes command line flags so hooking into
// "name" flag instead of "app".
const argv = yargs.option('name', {
  array: true,
  alias: 'apps',
  default: APPS,
}).argv;

// Note that webpack has deprecated the -p flag and now uses "mode".
// Additionally NODE_ENV seems to affect the build as well.
const BUILD = process.env.NODE_ENV === 'production';

const PARAMS = {
  BUILD,
  ...config.getAll(),
};

const templatePath = getTemplatePath();

module.exports = {
  mode: BUILD ? 'production' : 'development',
  devtool: BUILD ? 'source-map' : 'eval-cheap-module-source-map',
  entry: getEntryPoints(),
  output: {
    filename: 'assets/[name].[contenthash].js',
    assetModuleFilename: 'assets/[contenthash][ext]',
    clean: true,
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    // Node core modules were previously shimmed in webpack < v5.
    // These must now be opted into via the "fallback" option.
    fallback: {
      path: false,
    },
    // Webpack's chooses "browser" first by default which can increase
    // bundle sizes as this is often pre-bundled code.
    mainFields: ['module', 'browser', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        type: 'javascript/auto',
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.(css|less)$/,
        use: BUILD
          ? [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'less-loader',
            ]
          : ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.(png|jpg|svg|gif|mp4|pdf|eot|ttf|woff2?)$/,
        type: 'asset/resource',
      },
      {
        test: /\.md$/,
        type: 'asset/source',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
        exclude: templatePath,
        options: {
          esModule: false,
          preprocessor: (source, ctx) => {
            try {
              return compileTemplate(source)(PARAMS);
            } catch (err) {
              ctx.emitError(err);
              return source;
            }
          },
        },
      },
    ],
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    ...getTemplatePlugins(),
    ...getOptionalPlugins(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './src/assets/public'),
          to: path.join(__dirname, './dist'),
        },
      ],
    }),
  ],

  optimization: {
    minimizer: [
      (compiler) => {
        new TerserWebpackPlugin({
          terserOptions: {
            // Preventing function and class name mangling
            // for now to allow screen name magic to work.
            keep_fnames: true,
            keep_classnames: true,
          },
        }).apply(compiler);
      },
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  performance: {
    // 10mb limit to warn about insanity happening but as a
    // general rule we do no care about build sizes by default.
    maxAssetSize: 10_000_000,
    maxEntrypointSize: 10_000_000,
  },
  cache: {
    type: 'filesystem',
  },
};

function getEntryPoints() {
  const entryPoints = {};
  if (isMultiEntry()) {
    for (let app of argv.apps) {
      entryPoints[app] = getEntryPoint(`src/${app}/index.js`);
    }
  } else {
    entryPoints['public'] = getEntryPoint('src/index.js');
  }
  return entryPoints;
}

// koa-webpack -> webpack-hot-client requires this to be wrapped in an array
// https://github.com/webpack-contrib/webpack-hot-client/issues/11
// TODO: manually loading this for now
function getEntryPoint(relPath) {
  const entry = [];
  if (!BUILD) {
    entry.push('webpack-hot-middleware/client');
  }
  entry.push(path.resolve(relPath));
  return entry;
}

function getTemplatePath() {
  if (isMultiEntry()) {
    return path.resolve(__dirname, 'src/common/index.html');
  } else {
    return path.resolve(__dirname, 'src/index.html');
  }
}

function isMultiEntry() {
  return APPS.length > 1;
}

function getTemplatePlugins() {
  return argv.apps.map((app) => {
    return new HtmlWebpackPlugin({
      template: templatePath,
      chunks: [app, 'vendor'],
      templateParameters: {
        app,
        ...PARAMS,
      },
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: false,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
      },
      filename: path.join(app === 'public' ? '' : app, 'index.html'),
      inject: true,
    });
  });
}

function getOptionalPlugins() {
  const plugins = [];
  if (BUILD) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'assets/[name].[contenthash].css',
      })
    );
  } else {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  return plugins;
}
