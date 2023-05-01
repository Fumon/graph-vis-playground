// Utility function to calculate Euclidean distance between two points
function euclideanDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Utility function to get the source and target nodes of an edge
function getSourceTarget(edge) {
    return {
        source: edge.source(),
        target: edge.target()
    };
}

// Dijkstra's algorithm implementation that excludes edges in the 'skip' set
function dijkstraWithSkip(cy, source, target, weight, skip) {
    const options = {
        root: source,
        weight: (edge) => skip.has(edge) ? Infinity : weight(edge),
        directed: false
    };

    const dijkstra = cy.elements().dijkstra(options);
    return dijkstra.pathTo(target);
}

export function edgePathBundling(cy, k, d) {
    const lock = new Set();
    const skip = new Set();
    const weight = {};

    cy.edges().forEach((edge) => {
        const { source, target } = getSourceTarget(edge);
        const distance = euclideanDistance(source.position(), target.position());
        weight[edge.id()] = Math.pow(distance, d);
        // skip.add(edge);
    });

    const sortedEdges = cy.edges().sort((a, b) => weight[b.id()] - weight[a.id()]);
    const controlPoints = {};

    for (const edge of sortedEdges) {
        if (lock.has(edge)) {
            continue;
        }

        skip.add(edge);

        const { source, target } = getSourceTarget(edge);
        const path = dijkstraWithSkip(cy, source, target, (e) => weight[e.id()], skip);

        if (path.length < 3) {
            skip.delete(edge);
            continue;
        }

        const pathLength = path.slice(1).reduce((acc, point, i) => {
            const dx = point.x - path[i].x;
            const dy = point.y - path[i].y;
            return acc + Math.sqrt(dx * dx + dy * dy);
        }, 0);

        const straightLineDistance = euclideanDistance(source.position(), target.position());

        if (pathLength >= k * straightLineDistance) {
            skip.delete(edge);
            continue;
        }

        controlPoints[edge.id()] = path.nodes().map((node) => node.position());

        path.edges().forEach((e) => lock.add(e));
    }

    return controlPoints;
}