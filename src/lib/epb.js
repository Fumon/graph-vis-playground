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

export function edgePathBundling(cy, k, d, directed) {
    if (directed === undefined) {
        directed = false;
    }

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
                epbweight: Math.pow(distance, d),
            });
        });
    });


    const sortedEdges = cy.edges().sort((a, b) => b.data('epbweight') - a.data('epbweight'));

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
            weight: (e) => e.data('epbweight'),
            directed: directed,
        });


        if (astar.found === false || astar.path.length < 3) {
            s.skip = false;
            edge.scratch(ns, s);
            continue;
        }

        const path = astar.path;

        let pathLength = 0;
        astar.path.edges().forEach((e) => {
            pathLength += e.data('length');
        })

        const straightLineDistance = edge.data('length');

        if (pathLength >= k * straightLineDistance) {
            s.skip = false;
            edge.scratch(ns, s);
            continue;
        }

        const cps = path.nodes().map((node) => node.position())
        edge.data('controlPoints', cps);
        edge.data('controlPointCount', cps.length);

        path.edges().forEach((e) => {
            let escratch = e.scratch(ns);
            escratch.lock = true;
            e.scratch(ns, escratch);
        });
    }
}