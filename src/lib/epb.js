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
        skip.add(edge);
    });

    const sortedEdges = cy.edges().sort((a, b) => weight[b.id()] - weight[a.id()]);

    const controlPoints = {};

    for (const edge of sortedEdges) {
        if (lock.has(edge)) {
            continue;
        }

        skip.delete(edge);

        const { source, target } = getSourceTarget(edge);
        const path = dijkstraWithSkip(cy, source, target, (e) => weight[e.id()], skip);

        if (!path) {
            skip.add(edge);
            continue;
        }

        const pathLength = path.edges().reduce((sum, e) => sum + weight[e.id()], 0);
        const straightLineDistance = euclideanDistance(source.position(), target.position());

        if (pathLength > k * straightLineDistance) {
            skip.add(edge);
            continue;
        }

        controlPoints[edge.id()] = path.nodes().map((node) => node.position());

        path.edges().forEach((e) => lock.add(e));
    }

    return controlPoints;
}

export function calculateControlPointDistances(controlPoints, source, target) {
    const vectorST = { x: target.x - source.x, y: target.y - source.y };
    const unitVectorST = {
        x: vectorST.x / Math.sqrt(vectorST.x * vectorST.x + vectorST.y * vectorST.y),
        y: vectorST.y / Math.sqrt(vectorST.x * vectorST.x + vectorST.y * vectorST.y)
    };

    const unitVectorPerp = { x: -unitVectorST.y, y: unitVectorST.x };

    const distances = [];
    for (let i = 0; i < controlPoints.length; i += 1) {
        const vectorSP = {
            x: controlPoints[i].x - source.x,
            y: controlPoints[i].y - source.y
        };
        const distance = vectorSP.x * unitVectorPerp.x + vectorSP.y * unitVectorPerp.y;
        distances.push(distance);
    }

    return distances;
}

// Utility function to calculate the signed distance from a point to a line
function pointToLineSignedDistance(p, a, b) {
    const area = ((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / 2;
    const length = euclideanDistance(a, b);
    return (2 * area) / length;
}

// Convert control points to control-point-distances
export function controlPointsToDistances(edge, controlPoints) {
    const { source, target } = getSourceTarget(edge);
    const sourcePos = source.position();
    const targetPos = target.position();

    if (sourcePos.x === targetPos.x && sourcePos.y === targetPos.y) {
        // If they are the same, return an array of zeros
        return Array(controlPoints.length).fill(0);
    }

    return controlPoints.map((point) => pointToLineSignedDistance(point, sourcePos, targetPos));
}