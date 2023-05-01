import { edgePointsToWDs } from "./cyto/quick";

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
    const ns = "_epb";
    cy.batch(() => {
        cy.edges().forEach((edge) => {
            const { source, target } = getSourceTarget(edge);
            const distance = euclideanDistance(source.position(), target.position());
            edge.scratch(ns, {
                skip: false,
                lock: false,
            });
            edge.data({
                controlPointCount: 0,
                controlPoints: null,
                length: distance,
                weight: Math.pow(distance, d),
            });
        });
    });


    const sortedEdges = cy.edges().sort((a, b) => b.data('weight') - a.data('weight'));

    for (const edge of sortedEdges) {
        const d = edge.data();
        let s = edge.scratch(ns);
        if (s.lock) {
            continue;
        }

        s.skip = true;
        edge.scratch(ns, s);

        const { source, target } = getSourceTarget(edge);
        const astar = cy.elements().filter((elem) => elem.isEdge() ? !elem.scratch(ns).skip : true).aStar({
            root: source,
            goal: target,
            weight: (e) => e.data('weight'),
            directed: false,
        });


        if (!astar.found || astar.path.length < 3) {
            s.skip = false;
            edge.scratch(ns, s);
            continue;
        }

        const path = astar.path;

        const pathLength = path.edges().map((e) => e.data('length')).reduce((p, c) => p + c);

        const straightLineDistance = edge.data('length');

        if (pathLength >= k * straightLineDistance) {
            s.skip = false;
            edge.scratch(ns, s);
            continue;
        }

        const cps = path.nodes().map((node) => node.position()).slice(1, -2);
        edge.data('controlPoints', edgePointsToWDs(edge, cps));
        edge.data('controlPointCount', cps.length);

        path.edges().forEach((e) => {
            let escratch = e.scratch(ns);
            escratch.lock = true;
            e.scratch(ns, escratch);
        });
    }
}