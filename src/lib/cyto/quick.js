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

export function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};

export function paperAssignColor(p1, p2) {
    var dX = p2.x - p1.x;
    var dY = p2.y - p1.y;

    var angle = Math.atan2(-dY, dX);
    var degrees = 180 * angle / Math.PI;

    if (degrees < 0)
        degrees = (360 + Math.round(degrees)) - 180;

    if (degrees < 11.5)
        return "#733957"
    else if (degrees < 33)
        return "#8e4830"
    else if (degrees < 55.5)
        return "#b58837"
    else if (degrees < 78)
        return "#d6d389"
    else if (degrees < 100.5)
        return "#abdbca"
    else if (degrees < 123)
        return "#5ea6c8"
    else if (degrees < 155.5)
        return "#55609a"
    else if (degrees < 178)
        return "#723959"
    else
        return "#733957"
}