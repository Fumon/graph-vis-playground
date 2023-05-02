<script>
	import cytoscape from 'cytoscape';
	import { node, edge, edgePointToWD, edgePointsToWDs } from '$lib/cyto/quick.js';
	import { onMount } from 'svelte';

	let cy;
	let cydiv;
	onMount(() => {
		cy = cytoscape({
			container: cydiv,
			elements: testElems,
			layout: { name: 'preset' },
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						label: 'data(id)'
					}
				}
			]
		});

		// Edge stuff
		cy.edges('#a-b').forEach((edge) => {
			// let distances = [];
			// let weights = [];
			let points = [];
			for (const pt in cornerPositions) {
				for (let index = 0; index < 1; index++) {
					points.push(cornerPositions[pt]);
					// const {w, d} = edgePointToWD(edge, cornerPositions[pt]);
					// distances.push(d);
					// weights.push(w);
				}
			}

			const { w, d } = edgePointsToWDs(edge, points);

			console.log(`Distances: ${d}`);
			console.log(`Weights: ${w}`);

			edge.style({
				'curve-style': 'unbundled-bezier',
				'edge-distances': 'node-position',
				'control-point-distances': d,
				'control-point-weights': w
			});
		});
	});

	const cornerPositions = {
		ctl: { x: 0, y: 0 },
		tm: { x: 1000, y: 0 },
		ctr: { x: 2000, y: 0 },
		cbl: { x: 0, y: 2000 },
		bm: { x: 1000, y: 2000 },
		cbr: { x: 2000, y: 2000 }
	};

	const testElems = {
		nodes: [
			node('a', 50, 100),
			node('b', 150, 100),
			...(() => {
				let out = [];
				for (const n in cornerPositions) {
					out.push(node(n, cornerPositions[n].x, cornerPositions[n].y));
				}
				return out;
			})()
		],
		edges: [edge('a-b', 'a', 'b')]
	};
</script>

<div id="content" bind:this={cydiv} />

<style>
	#content {
		width: 100vw;
		height: 100vh;
	}
</style>
