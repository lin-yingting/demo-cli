const hasCircle = (packageName, children, visited=new Set(), path=[]) => {
    if(visited.has(packageName)){
        return true
    }

    if(!d){ // 一个包没有依赖就不可能成环
        return false
    }
    visited.add(packageName)
    path.push(packageName)
    for(const child of children){
        if(hasCircle(child,child.children, visited, path)){
            return true
        }
    }
    console.log("====++++",path)
    return false
}

hasCircle(data.name, data.children)