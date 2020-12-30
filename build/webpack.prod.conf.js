
var glob = require('glob');
var merge = require('webpack-merge');

var baseWebpackConfig = require('./webpack.base.conf');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');

// 获得入口js文件
var chunks = Object.keys(baseWebpackConfig.entry); 
chunks.forEach(function(pageName) {

    const templatePath = glob.sync(`./src/views/**/${pageName}.html`)[0];
    var conf = {
        filename: pageName + '.html',
        template: templatePath, // 模板路径
        chunks: ['commons', pageName], // 每个html引用的js模块
        chunksSortMode: 'manual',
        inject: true, // js插入位置
        hash: false,
        minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        },
    };
    baseWebpackConfig.plugins.push(new HtmlWebpackPlugin(conf));
})

var webpackConfig = merge( baseWebpackConfig, {
    mode: 'production',
    performance: {
        hints: false
    },
    optimization: {
        concatenateModules: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                // sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    ecma: undefined,
                    parse: {},
                    compress: {},
                    mangle: true, // Note `mangle.properties` is `false` by default.
                    module: false,
                    // Deprecated
                    output: null,
                    format: {
                        comments: false,
                    },
                    toplevel: false,
                    nameCache: null,
                    ie8: false,
                    keep_classnames: undefined,
                    keep_fnames: false,
                    safari10: false,
                },
                extractComments: false,
            }),
            // Compress extracted CSS. We are using this plugin so that possible
            // duplicated CSS from different components can be deduped.
            // new OptimizeCSSPlugin({
            //     cssProcessorOptions: {
            //         safe: true,
            //         autoprefixer: false
            //     }
            // }),
        ],
    }
});

// console.log('webpackConfig....', JSON.stringify(conf));
if (process.env.BUNDLE_ANALYZ) {
    var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackConfig.plugins.push(new BundleAnalyzerPlugin(
        { 
            reportFilename: './reports-index.html',
            analyzerPort: 8099,
        }
    ))
}

module.exports = webpackConfig;