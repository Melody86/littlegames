var path = require('path');
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
        filename: pageName + '/' + pageName + '.html',  //eg. flybird/flybird.html
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
    output: {
        path: path.resolve(__dirname, '../dist'),
        //filename对 initially loaded 入口bundle 生效, 将chunks放入对应模块的目录中
        filename: (pathData, assetInfo)=>{
            let entryPath = '';
            // 如果当前chunk包含entry points入口, 添加入口页标识
            if( pathData.chunk.hasEntryModule() ){
                entryPath = pathData.chunk.name +'/';
            }
            // console.log('assetInfo', assetInfo);
            // if(pathData.chunk.name === pathData.chunk._groups)
            return entryPath + '[name].js';
        },
        //chunkFileName 对on-demand-loaded 按需加载chunk生效
        chunkFilename: (pathData, assetInfo)=>{
            if(!pathData.url){
                return '[name].js';
            }else{
                return pathData.url + '/' + '[name].js';
            }
            // console.log('pathData', pathData.url);
            // console.log('assetInfo', assetInfo);
            // let entryPath = pathData.runtime ? (pathData.runtime +'/') : '';
            // return entryPath + '[name].js';
        },
        
        // publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
        publicPath: './',
    },
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
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 512*1024,  //算的是 模块压缩前的大小, 即bundle-analyz中的Stat大小, Pared之后会小比较多
            minChunks: 1,
            maxAsyncRequests: 20,
            maxInitialRequests: 20,
            automaticNameDelimiter: '~',
            // name: true,
            cacheGroups: {
                // html-webpack-plugin 会按照groups的顺序进行 inject
                pdfjs:{
                    chunks: "all",
					test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
                    name: 'pdfjs',
                    maxSize: 2048*1024,	//模块超过maxSize时进行分割，分割后的每个模块至少是minSize大小
                    minSize: 0,
                    priority: 300,
				},
				swiper:{
                    chunks: "all",  //swiper 中引入量browserify
					test: /[\\/]node_modules[\\/](swiper|elliptic|browserify-rsa|browserify-sign|browserify-aes)[\\/]/,
                    name: 'swiper',
					minChunks: 1,
                    maxSize: 1024*1024,	//模块超过maxSize时进行分割，分割后的每个模块至少是minSize大小
                    minSize: 100*1024,
                    priority: 300,
                },
                canvas:{
                    chunks: "all",
					test: /[\\/]node_modules[\\/](html2canvas|echarts[\\/])/,
                    name: 'canvas',
					minChunks: 1,
                    maxSize: 2048*1024,	//模块超过maxSize时进行分割，分割后的每个模块至少是minSize大小
                    minSize: 1024*1024,
                    priority: 300,
                },
                moment:{
                    chunks: "all",
					test: /[\\/]node_modules[\\/]moment[\\/]/,
                    name: 'moment',
					minChunks: 1,
                    maxSize: 512*1024,	//模块超过maxSize时进行分割，分割后的每个模块至少是minSize大小
                    minSize: 0,
                    priority: 300,
                },
                zrender:{
                    chunks: "all",
					test: /[\\/]node_modules[\\/]zrender[\\/]/,
                    name: 'zrender',
					minChunks: 1,
                    maxSize: 512*1024,	//模块超过maxSize时进行分割，分割后的每个模块至少是minSize大小
                    minSize: 0,
                    priority: 300,
                },
                vendors: { // 抽离第三插件
                    chunks: 'all',
                    name: 'vendors',
                    minChunks: 2,
                    maxSize: 1024*1024,
                    test: /[\\/]node_modules[\\/]/,
                    minSize: 100*1024,  //RMS开启Gzip压缩后，size很小
                    priority: 10 //设置优先级 防止和自定义组件混合，不进行打包
                },
                coreJs: { // 抽离第三插件
                    chunks: 'all',
                    name: 'coreJs',
                    minChunks: 1,
                    maxSize: 1024*1024,
                    test: /[\\/]node_modules[\\/](vue|core-js|vue-router|vuex)[\\/]/,
                    minSize: 100*1024,  //RMS开启Gzip压缩后，size很小
                    priority: 300 //设置优先级 防止和自定义组件混合，不进行打包
                },
                commons: { // 抽离自定义公共组件
                    chunks: 'all',
                    name: 'commons',
                    minChunks: 2,
                    maxSize: 1024*1024,
                    minSize: 100*1024,
                    reuseExistingChunk: true //	如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
                },
                default: false,
            }
        },
        runtimeChunk:{
            name: 'minifest',   //运行时代码(包括按需加载文件的索引)，会被提前inject
        },
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