const path = require('path')
const fs1 = require('fs').promises;
const fs = require('fs');
const analyzeInfo = require('../../config/config').analyzeInfo // ['name', 'version','dependencies']

const dirPath = process.cwd()
const getPackageJSON = async () => {
    const packageJSONPath = path.join(
        dirPath, // 这里获取的是到当前文件夹的路径
        'package.json'
    )
    return await readPackageJSON(packageJSONPath)
}

function countNodeModulesFolders(parentPath) {
    const parentPathMid = parentPath.split('\\');

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory() && entry.name === 'node_modules') {
            nodeModulesCount++;
        }
    }

    return nodeModulesCount;
}

function selectPath(packageName, parentPath) {
    return new Promise((resolve, reject) => {
        if (parentPath) {
            // console.log('parentPath', parentPath);
            const targetFileName = path.join(                      
                parentPath,
                'node_modules',
                packageName,
                'package.json'
            )
            fs.access(targetFileName, fs.constants.F_OK, (err) => {
                if (err) {
                    const parts = parentPath.split('\\'); // 将路径分割为各级部分
                    const lastPart = parts[parts.length - 1]==''?parts[parts.length - 3]:parts[parts.length - 2]; // 
                    const hasAtSymbol = lastPart.startsWith('@');
                    packageJSONPath = path.join(
                        hasAtSymbol?path.dirname(path.dirname(parentPath)):path.dirname(parentPath),
                        packageName,
                        'package.json'
                    )

                    // 这里应该用递归的，明天再处理
                    const nodeModulesCount = parts.filter(word => word === 'node_modules').length;
                    if (nodeModulesCount>=2) {
                        packageJSONPath = path.join(                      // 执行demo-cli 的目录为项目的根目录
                            dirPath,
                            'node_modules',
                            packageName,
                            'package.json'
                        )
                    }

                    // console.log('packageJSONPath111', packageJSONPath);
                    resolve(packageJSONPath)
                } else {
                    packageJSONPath = targetFileName
                    // console.log('packageJSONPath222', packageJSONPath);
                    resolve(packageJSONPath)
                }
            });
        } else {
            packageJSONPath = path.join(                      // 执行demo-cli 的目录为项目的根目录
                dirPath,
                'node_modules',
                packageName,
                'package.json'
            )
            // console.log('packageJSONPath333', packageJSONPath);
            resolve(packageJSONPath)
        }
    })
}

const getDependentPackageDetail = async (packageName, parentPath) => {
    // console.log('parentPath',parentPath);
    
    const packageJSONPath = await selectPath(packageName, parentPath)
    // console.log('packageJSONPath', packageJSONPath);
    return readPackageJSON(packageJSONPath)
}

// const getDependentPackageDetail = async (packageName, installPath = dirPath) => {
//     const ids = installPath.indexOf('node_modules')
//     // 适用于非monorepo管理方式的库、非pnpm 管理的项目
//     const packageJSONPath = ids < 0 ?
//         path.join(                      // 执行demo-cli 的目录为项目的根目录
//             installPath,
//             'node_modules',
//             packageName,
//             'package.json'
//         )
//         : path.join(
//             installPath.slice(0, ids),   // 执行demo-cli 的目录为node_modules 内的目录
//             'node_modules',
//             packageName,
//             'package.json'
//         )
//     return readPackageJSON(packageJSONPath)
// }
/**
 info:{
    name: 'demo-cli',
  version: '1.0.0',
  dependencies: ['commander'] 
}
 */
const readPackageJSON = async(pathJson) => {
    // console.log('-----------------------');
    // console.log('pathJson',pathJson);
    return fs1.readFile(pathJson, 'utf8').then(
        (contents) => {
            const info = {}
            // console.log('pathJson',pathJson);
            const parsedJSON = JSON.parse(contents)
            analyzeInfo.forEach(key => {
                if (key === 'dependencies') {
                    info["children"] = parsedJSON[key] ? Object.keys(parsedJSON[key]) : []
                } else {
                    info[key] = parsedJSON[key] || null
                }
            })
            // info.path = path
            // console.log("info",info);
            return Promise.resolve(info)
        }).then((info) => {
            return new Promise((resolve, reject) => {
                fs.lstat(path.dirname(pathJson), (err, stats) => {
                    if (err) {
                        console.error('Error:', err.message);
                        reject(err.message)
                    } else {
                        if (stats.isSymbolicLink()) {
                            fs.readlink(path.dirname(pathJson), (err, link) => {
                                if (err) {
                                    console.error('Error:', err.message);
                                    reject(err.message)
                                } else {
                                    // console.log('Symbolic link:', link);
                                    // console.log('Symbolic path.dirname():', path.dirname(link));
                                    info.path = link
                                    // console.log(info);
                                    return resolve(info)
                                }
                            });
                        } else {
                            // console.log('Path is not a symbolic link.');
                            info.path = path.dirname(pathJson)
                            // console.log(info);
                            return resolve(info)
                        }
                    }
                });
            })
        }).then((info) => {
            return Promise.resolve(info)
        })
}

const analyzePackage = async (depth) => {
    const info = await getPackageJSON()
    // console.log('getPackageJSON',info);
    let childList

    async function deepDepend(info, parent, n) { // 遍历的依赖，层次的深度
        if (n === -1) return
        parent === null || parent.children.push(info)
        info.name = `${info.name}@${info.version}`
        delete info.version
        delete info.version
        // console.log('info---------',info);
        childList = info.children
        info.children = []
        if (childList && childList.length > 0) {
            await Promise.all(childList.map(async (child) => {
                await deepDepend(await getDependentPackageDetail(child, info.path), info, n - 1)
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