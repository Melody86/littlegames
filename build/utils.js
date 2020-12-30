var path = require('path');
var glob = require('glob');

/*
* 获取多入口文件
* @param  globPath
* @return entries 
*/
exports.getMultiEntry = function (globpath){
    const entries = {};
    glob.sync(globpath).forEach( entry => {
        let pageName =  path.basename(entry, path.extname(entry));
        let folders  =  entry.split('/').splice(-3); // views/page/page.html
        let views    =  folders[0];
        // 确保都在views目录下，层级一致
        if (views === 'views') {
            let moduleName = folders[1];
            entries[ moduleName ] = entry;
        }
    });
    return entries;
}