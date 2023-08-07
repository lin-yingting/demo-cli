const myAction = require('./action')

const myCommander = function(program){
    program.command('analyze')
    .alias('aly')
    // .option('-p --project name <name>', '项目名称')
    .option('-d --depth <n>', '递归分析的层次深度')
    .option('-s --server', '用服务器显式包的依赖分析(默认)', true)
    .option('-j --json [path]', '将包的依赖分析通过json格式的文件导出')
    .description('分析当前目录package.json中的全量依赖关系')
    .action(myAction)
}

module.exports = myCommander