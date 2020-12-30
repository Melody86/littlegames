
var path = require('path');
var utils = require('./utils');
const pxtorem = require('postcss-pxtorem');

// var VueLoaderPlugin = require('vue-loader/lib/plugin');
const { VueLoaderPlugin } = require('vue-loader');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

let styleCss = new ExtractTextPlugin({
    filename: `assets/css/[name].css?v=[contenthash:5]`,
    allChunks: true
});

let postcssLoaderOptions = {
    loader : 'postcss-loader',
    options: {
      plugins: (loader) => [
        //将px转换为rem
        pxtorem({
          rootValue: 37.5, // 设计稿为750px
          propList : ['*']
        }),
      ]
    }
  }
 
module.exports = {
    entry: utils.getMultiEntry( './src/views/**/*.js' ),
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: (pathData, assetInfo)=>{
            // let entryName = pathData.runtime || pathData.Chunk.name || pathData.Chunk;
            console.log('pathData----', pathData);
            console.log('assetInfo---', assetInfo);
            return '[name].js'
        },
        // publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
        publicPath: './',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.scss'],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'src': path.resolve(__dirname, '../src'),
            'assets': path.resolve(__dirname, '../src/_assets'),
            'components': path.resolve(__dirname, '../src/_components'),
            'images': path.resolve(__dirname, '../src/_assets/images'),
            'fonts': path.resolve(__dirname, '../src/_assets/fonts'),
        }
    },
    module: {
        rules: [
            // {
            //     test: /\.vue$/,
            //     loader: 'eslint-loader',
            //     enforce: 'pre',
            //     options: {
            //         fix: true,
            //         formatter: require('eslint-friendly-formatter') // 编译后错误报告格式
            //     },
            // },
            {
                test: /\.vue$/,
                // include: srcPath,
                loader: 'vue-loader',
                options: {
                    postcss: [
                        pxtorem({
                            rootValue: 37.5,
                            propList: ['*'],
                        })
                    ],
                    loaders: {
                        css: styleCss.extract(['css-loader?sourceMap', 'sass-loader', postcssLoaderOptions]) // no lang
                    }
                }
            }
        ]
    },
    plugins:[
        new VueLoaderPlugin(),
    ],
}

