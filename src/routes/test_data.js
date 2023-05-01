/// Things!


function node1(name, x, y) {
    const pos = { x: x, y: y };

    return {
        data: {
            id: name,
        },

        position: pos,
    }
}

function edge1(name, from, to) {
    return {

        data: {
            id: `${from}-${to}`,
            source: from,
            target: to,
        }
    }
}

function datagen1(nodes, edges) {
    return {
        nodes: nodes,
        edges: edges,
    }
}

export const positionTest = (() => {
    const nodecount = 19;
    let g = [];
    for (let i = 0; i < nodecount; i++) {
        const tau = 25 / i;
        g.push(node1(`${i}`,
            25 / i,
            Math.sin(tau),
        ));
    }

    return g;
})();