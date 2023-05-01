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

export const slightlyTricky = [
    // Nodes
    { data: { id: 'A' }, position: { x: 20, y: 20 } },
    { data: { id: 'B' }, position: { x: 180, y: 20 } },
    { data: { id: 'C' }, position: { x: 340, y: 20 } },
    { data: { id: 'D' }, position: { x: 20, y: 180 } },
    { data: { id: 'E' }, position: { x: 180, y: 180 } },
    { data: { id: 'F' }, position: { x: 340, y: 180 } },
    { data: { id: 'G' }, position: { x: 20, y: 340 } },
    { data: { id: 'H' }, position: { x: 180, y: 340 } },
    { data: { id: 'I' }, position: { x: 340, y: 340 } },

    // Additional nodes
    { data: { id: 'J' }, position: { x: 100, y: 100 } },
    { data: { id: 'K' }, position: { x: 260, y: 100 } },
    { data: { id: 'L' }, position: { x: 100, y: 260 } },
    { data: { id: 'M' }, position: { x: 260, y: 260 } },

    // Edges
    { data: { id: 'AB', source: 'A', target: 'B' } },
    { data: { id: 'BC', source: 'B', target: 'C' } },
    { data: { id: 'AD', source: 'A', target: 'D' } },
    { data: { id: 'BE', source: 'B', target: 'E' } },
    { data: { id: 'CF', source: 'C', target: 'F' } },
    { data: { id: 'DG', source: 'D', target: 'G' } },
    { data: { id: 'EH', source: 'E', target: 'H' } },
    { data: { id: 'FI', source: 'F', target: 'I' } },
    { data: { id: 'GH', source: 'G', target: 'H' } },
    { data: { id: 'HI', source: 'H', target: 'I' } },

    // Additional edges
    { data: { id: 'AJ', source: 'A', target: 'J' } },
    { data: { id: 'BK', source: 'B', target: 'K' } },
    { data: { id: 'CL', source: 'C', target: 'L' } },
    { data: { id: 'DM', source: 'D', target: 'M' } },
    { data: { id: 'JL', source: 'J', target: 'L' } },
    { data: { id: 'KM', source: 'K', target: 'M' } }
];