const { analyzePackage } = require('../utils/getPackageJSON')
const { startServer } = require('../../server')
const ora = require('ora')     // 显式指令处理中的动画
const open = require('open')   // 打开浏览器
const { convertToGrapth } = require('../utils/convertToGraph')

const myAction = (options) => {
    const serverOption = options.json ? (options.server ? true : false) : true;
    const jsonOption = options.json || null;

    // 启动加载指示器
    const spinner = ora().start() 
    analyzePackage(options.depth)
    .then(
        (data) => {
            console.log("===",JSON.stringify(data))
            // 将data转换成图
            convertToGrapth(data)
            // 根据选项进行相应的逻辑判断和处理
            // 打开网页可视化依赖分析
            if (serverOption) {
                startServer()
                open('http://localhost:3000')   
                
              }
            // 将依赖写入json文件，没有提供路径写入指令执行的路径
            // 提供，写入指定路径，考虑绝对路径、相对路径
            if(jsonOption){
                //。。。。
            }
            spinner.succeed("解析完成")
        } 
    )
    .catch((reason => {
        console.error('加载失败的原因',reason)
    })
    )
}

module.exports = myAction
