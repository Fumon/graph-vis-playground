import Victor from "victor";

export function node(name, x, y) {
    const pos = { x: x, y: y };

    return {
        data: {
            id: name,
        },

        position: pos,
    }
}

export function edge(name, from, to) {
    return {

        data: {
            id: `${from}-${to}`,
            source: from,
            target: to,
        }
    }
}

function lineSegmentToPointWD(s, t, point) {
    let pv = Victor.fromObject(point).subtract(s);
    let dv = t.clone().subtract(s);
    let dvnorm = dv.clone().normalize();

    // Projection where B is the unit length
    let pvdotdvnorm = pv.dot(dvnorm);
    let w = pvdotdvnorm / dv.length();

    // Rejection in real coordinates
    let dvperp = new Victor(-1 * dv.y, dv.x);
    let d = pv.dot(dvperp) / dv.length();

    return { w: w, d: d };
}

export function edgePointToWD(edge, point) {
    let s = Victor.fromObject(edge.source().position());
    let t = Victor.fromObject(edge.target().position());

    return lineSegmentToPointWD(s, t, point);
}

export function edgePointsToWDs(edge, points) {
    let warr = [];
    let darr = [];

    let s = Victor.fromObject(edge.source().position());
    let t = Victor.fromObject(edge.target().position());

    points.forEach((pt) => {
        const { w, d } = lineSegmentToPointWD(s, t, pt);
        warr.push(w);
        darr.push(d);
    });

    return { w: warr, d: darr };
}