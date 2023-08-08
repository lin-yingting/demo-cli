const convertToGrapth = (data) => {
    const graph = {
        nodes: [],
        edges:[]
    }

    const processNode = (node,parent) => {
        // const nodeId = `${node.name}@${node.version}`
        const nodeId = node.name
        graph.nodes.push({id: nodeId, label: nodeId})

        if(parent) {
            const edge = {source: parent, target: nodeId}
            graph,edges.push(edge)
        }

        if(node.children.length > 0){
            node.children.forEach(child => {processNode(child, nodeId)})
        }
    }

    processNode(data, null)
    return graph
}

module.exports = {
    convertToGrapth
}