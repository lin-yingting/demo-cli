const path = require('path')
const fs = require('fs').promises;
const analyzeInfo = require('../../config/config').analyzeInfo // ['name', 'version','dependencies']

const dirPath = process.cwd()
const getPackageJSON = async () => {
    const packageJSONPath = path.join(
      dirPath, // 这里获取的是到当前文件夹的路径
      'package.json'
    )
    return readPackageJSON(packageJSONPath)
}
const getDependentPackageDetail = async (packageName, installPath=dirPath) => {
    const ids = installPath.indexOf('node_modules')
    // 适用于非monorepo管理方式的库、非pnpm 管理的项目
    const packageJSONPath = ids < 0 ? 
        path.join(                      // 执行demo-cli 的目录为项目的根目录
            installPath, 
            'node_modules',
            packageName,
            'package.json'
        )
        : path.join(
            installPath.slice(0,ids),   // 执行demo-cli 的目录为node_modules 内的目录
            'node_modules',
            packageName,
            'package.json'
        )
        return readPackageJSON(packageJSONPath)
}
/**
 info:{
    name: 'demo-cli',
  version: '1.0.0',
  dependencies: ['commander'] 
}
 */
const readPackageJSON = (path) => {
    return fs.readFile(path, 'utf8').then(
        (contents) => {
            const info = {}
          const parsedJSON = JSON.parse(contents)
        analyzeInfo.forEach(key => {
            if(key === 'dependencies') {
                info["children"] = parsedJSON[key] ? Object.keys(parsedJSON[key]) : []
            }else{
                info[key] = parsedJSON[key] || null
            }
        })
          return info
        })
}

const analyzePackage = async (depth) => {
   const info = await getPackageJSON()
   let childList

   async function deepDepend(info,parent,n){ // 遍历的依赖，层次的深度
        if(n === -1) return 
        parent === null || parent.children.push(info)
        info.name = `${info.name}@${info.version}`
        delete info.version
        delete info.version
        childList = info.children
        info.children = []
        if(childList && childList.length >0){
            await Promise.all(childList.map(async (child) => {
                await deepDepend(await getDependentPackageDetail(child), info, n - 1)
              }))
        }
    }
    await deepDepend(info, null, depth)
    return info
}
// const analyzePackage = async (depth) => {
//     const startNode = await getPackageJSON()
//     const graph = {
//         nodes: [],
//         edges:[]
//     }
//     const processNode = async (node,parent,n) => {

//         if (n === 0) return
//         const nodeId = `${node.name}@${node.version}`
//         graph.nodes.push({id: nodeId, label: nodeId})

//         if(parent) {
//             const edge = {source: parent, target: nodeId}
//             graph.edges.push(edge)
//         }
//         if(node.children && node.children.length > 0){
//             const childPromises = node.children.map(async (child) => {
//                 await processNode(await getDependentPackageDetail(child), nodeId, n-1);
//               })
//               await Promise.all(childPromises);  // 等待所有子节点处理完毕
//         }
//     }
//     await processNode(startNode, null, parseInt(depth) + 1)
//     return graph
// }

module.exports = {
    analyzePackage
}