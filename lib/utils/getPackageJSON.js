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
const getDependentPackageDetail = async (packageName, installPath) => {
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
            info[key] = key === 'dependencies' ? 
                (parsedJSON[key] ? Object.keys(parsedJSON[key]) : null)
                : parsedJSON[key] || null
        })
          return info
        })
}

const anlayzePackage = async (depth) => {
   const info = await getPackageJSON()

   async function each(info,n){ // 遍历的依赖，层次的深度
        if(n === 0) return 
        const len = info.length
        
        let tmp = null,
            result = null
        const dependList = []
        for(let d=0; d<len; d++){
            const len_2 = info[d]['dependencies'] ? info[d]['dependencies'].length : null
            for(let i=0; i<len_2; i++){
                if(typeof info[d]['dependencies'][i] !== 'string') return null
                tmp = await getDependentPackageDetail(info[d]['dependencies'][i],dirPath)
                // console.log("n:",n,"d:", d, 'i:',i, "tmp:",tmp)
                dependList.push(tmp)
            }
            info[d]['dependencies'] = dependList
            await each( info[d]['dependencies'], n-1)
        }
        return info
    }
    result = await each([info], depth)
    return result
}

const formatInfo = async () => {

}

module.exports = {
    anlayzePackage
}