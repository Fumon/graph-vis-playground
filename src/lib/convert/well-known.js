// Converts from
// {..., "nodes": [...{"x": 123, "y": 456, "id": "99"}, ...], "links": [..., {"source": "0", "target": "131"}, ...]}
// To
// { nodes: [{data: {id: "99", x: 123, y: 456}, ...], edges: [{data: {id: "0-131", source:"0",target: "131"}}, ...,] }
export function convert(input_data) {
    const scale = 1;
    const xscale = 1;
    const flipy = -1;
    let count = 0;
    return {
        nodes: input_data["nodes"].map((node) => {
            return { data: { id: node.id }, position: { x: node.x * xscale * scale, y: node.y * scale * flipy } };
        }),
        edges: input_data["links"].map((link) => {
            count = count + 1;
            return { data: { id: `${link.source}-${link.target}`, source: link.source, target: link.target } };

        }),
    };

    // let output = [];
    // for (let i = 0; i < input_data["nodes"].length; i++) {
    //     const node = input_data["nodes"][i];
    //     output.push({ id: node.id, x: node.x, y: node.y });
    // }
}

import * as airlines from './airlines.json';
import * as airtraffic from './airtraffic.json';
import * as cubes1 from './cubes1.json';
import * as cubes2 from './cubes2.json';
import * as cubes3 from './cubes3.json';
import * as cubes4 from './cubes4.json';
import * as migrations from './migrations.json';
import * as noise from './noise.json';
import * as simple from './simple.json';


export const wellknown_datasets = {
    airlines: convert(airlines),
    airtraffic: convert(airtraffic),
    cubes1: convert(cubes1),
    cubes2: convert(cubes2),
    cubes3: convert(cubes3),
    cubes4: convert(cubes4),
    migrations: convert(migrations),
    noise: convert(noise),
    simple: convert(simple),
}

export const wellknown_datasets_array = [
    { name: "airlines", data: wellknown_datasets.airlines },
    { name: "airtraffic", data: wellknown_datasets.airtraffic },
    { name: "cubes1", data: wellknown_datasets.cubes1 },
    { name: "cubes2", data: wellknown_datasets.cubes2 },
    { name: "cubes3", data: wellknown_datasets.cubes3 },
    { name: "cubes4", data: wellknown_datasets.cubes4 },
    { name: "migrations", data: wellknown_datasets.migrations },
    { name: "noise", data: wellknown_datasets.noise },
    { name: "simple", data: wellknown_datasets.simple },
];

export default wellknown_datasets;