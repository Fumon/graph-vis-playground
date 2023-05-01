// Converts from
// {..., "nodes": [...{"x": 123, "y": 456, "id": "99"}, ...], "links": [..., {"source": "0", "target": "131"}, ...]}
// To
// { nodes: [{data: {id: "99", x: 123, y: 456}, ...], edges: [{data: {id: "0-131", source:"0",target: "131"}}, ...,] }

export function convert(input_data) {
    const scale = 50;
    let count = 0;
    return {
        nodes: input_data["nodes"].map((node) => {
            return { data: { id: node.id }, position: { x: node.x * scale, y: node.y * scale } };
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