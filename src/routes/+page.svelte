<script>
	import cytoscape from 'cytoscape';
	import cola from 'cytoscape-cola';
	import coseBilkent from 'cytoscape-cose-bilkent';
	import { edgePathBundling, controlPointsToDistances } from '$lib/epb';
	import { onMount } from 'svelte';

	import * as exampleData from './cubes1.json';
	import * as td from './test_data.js';
	import { convert } from '$lib/convert/well-known.js';

	const elems = convert(exampleData);

	/**
	 * @type {HTMLDivElement}
	 */
	let gcont;
	let epb;

	const defaultElements = [
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

	const layouts = [
		{
			name: 'random',
			animate: false,
			animationDuration: 1000,
			animationEasing: 'ease-out'
		},
		{
			name: 'cose',

			// Whether to animate while running the layout
			// true : Animate continuously as the layout is running
			// false : Just show the end result
			// 'end' : Animate with the end result, from the initial positions to the end positions
			animate: false,
			animationDuration: 1000,
			animationEasing: 'ease-out',

			// The layout animates only after this many milliseconds for animate:true
			// (prevents flashing on fast runs)
			animationThreshold: 10
		},
		{
			name: 'cola',
			animate: false,
			maxSimulationTime: 40000,
			refresh: 1,
			// flow: {axis: 'y', minSeparation: 150},
			// edgeJaccardLength: 150,
			avoidOverlap: true
			// edgeLength: 400,
			// randomize: true,
		},
		{
			name: 'cose-bilkent',
			quality: 'proof',
			animate: 'end',
			// randomize: false,
			edgeElasticity: 0.8,
			refresh: 1,
			// idealEdgeLength: 100,
			nodeDimensionsIncludeLabels: true
		},
		{
			name: 'grid',
			rows: '4'
		}
	];

	let cy;
	let bcy;
	let layout;
	let layoutIndex;

	onMount(() => {
		// console.log(exampleData);
		// console.log(elems);
		cytoscape.use(cola);
		cytoscape.use(coseBilkent);

		// const graphdata = td.positionTest;
		const graphdata = elems;
		console.log(JSON.stringify(graphdata));

		cy = cytoscape({
			container: gcont,
			elements: graphdata,

			style: [
				// the stylesheet for the graph
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						label: 'data(id)'
					}
				},

				{
					selector: 'edge',
					style: {
						width: 9,
						'line-color': '#ccc',
						'target-arrow-color': '#c3c',
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier'
						// label: 'data(id)',
					}
				}
			],

			layout: {
				name: 'preset'
			}
		});

		bcy = cytoscape({
			container: epb,
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

		updateBcy();

		// cy.on('position', (event) => {
		// 	updateBcy();
		// });
	});

	function updateBcy() {
		bcy.unmount();
		bcy.destroy();

		bcy = cytoscape({
			container: epb,
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						label: 'data(id)'
					}
				},
				{
					selector: 'edge',
					style: {
						width: 3,
						// 'line-color': '#ccc',
						'curve-style': 'unbundled-bezier',
						'line-color': 'black',
						'target-arrow-color': 'black',
						'target-arrow-shape': 'triangle'
					}
				}
			],
			layout: 'preset'
		});

		const c1json = cy.json();
		bcy.json({
			elements: c1json.elements,
			layout: c1json.layout,
			zoom: c1json.zoom,
			pan: c1json.pan
		});

		console.log(JSON.stringify(c1json.elements));

		const k = 1.5;
		const d = 1;
		let controlPoints = edgePathBundling(cy, k, d);

		// console.log(`${JSON.stringify(controlPoints)}`);
		bcy.edges().forEach((edge) => {
			const id = edge.id();
			// console.log(`${edge.id()}`);

			if (controlPoints[id]) {
				const distances = controlPointsToDistances(edge, controlPoints[id]);

				// const weights = Array.from(
				// 	{ length: distances.length },
				// 	(_, i) => i / (distances.length - 1)
				// );

				// console.log(`ControlPoints: ${JSON.stringify(controlPoints[id])}`)
				// console.log(`Points: ${JSON.stringify(edge.source().position())} ${JSON.stringify(edge.target().position())}`)
				// console.log(`Distances: ${JSON.stringify(distances)}`);
				// console.log(`Weights: ${JSON.stringify(weights)}`);
				edge.style({
					'control-point-distances': distances,
					'control-point-weights': '0.5'
				});
			}
		});
	}

	function addNode() {
		const rndn = Math.random() * 10000;

		cy.add([
			{
				data: { group: 'nodes', id: `c${rndn}` }
			},
			{
				data: { group: 'edges', id: `c${rndn}b`, source: `c${rndn}`, target: 'b' }
			}
		]);
	}

	let randomNetCounter = 0;
	function randomNet() {
		const nodeCount = 70;
		const connectionThresh = 0.99;

		const namefunc = (num) => `rn-${randomNetCounter}-${num}`;

		let toAdd = [];
		for (let i = 0; i < nodeCount; i++) {
			toAdd.push({
				data: { group: 'nodes', id: namefunc(i) }
			});
		}

		for (let i = 0; i < nodeCount; i++) {
			for (let j = 0; j < nodeCount; j++) {
				// i -> j
				if (Math.random() > connectionThresh) {
					toAdd.push({
						data: {
							group: 'edges',
							id: `${namefunc(i)}${namefunc(j)}`,
							source: namefunc(i),
							target: namefunc(j)
						}
					});
				}

				// j -> i
				// if (Math.random() > connectionThresh) {
				// 	toAdd.push({
				// 		data: {
				// 			group: 'edges',
				// 			id: `${namefunc(j)}${namefunc(i)}`,
				// 			source: namefunc(j),
				// 			target: namefunc(i)
				// 		}
				// 	});
				// }
			}
		}

		cy.add(toAdd);
		randomNetCounter++;
	}

	function updateLayout() {
		if (layoutIndex !== null) {
			newLayout(layoutIndex);
		}
	}

	function newLayout(index) {
		if (layout !== undefined) {
			layout.stop();
		}
		layout = cy.layout(layouts[index]);
		layout.pon('layoutstop').then(function (event) {
			console.log('layoutstop');
			updateBcy();
		});

		layout.run();
		layoutIndex = index;
	}

	function updateLayoutHandler(event) {
		newLayout(event.target.value);
	}
</script>

<div id="content">
	<h1>Welcome to CytoTest</h1>
	<div id="nodesbar" class="hbar">
		<button on:click={addNode}>Add Something</button><button on:click={randomNet}
			>Add Random Net</button
		>
	</div>
	<div id="layoutsbar" class="hbar">
		<fieldset on:change={updateLayoutHandler}>
			<legend>Select a layout:</legend>

			{#each layouts as layout, i}
				{#if false}
					<input type="radio" id={layout.name} name="layout" value={i} checked />
				{:else}
					<input type="radio" id={layout.name} name="layout" value={i} />
				{/if}
				<label for={layout.name}>{layout.name}</label>
			{/each}
		</fieldset>
		<button on:click={updateLayout}>Update Layout</button>
	</div>

	<div class="row">
		<div id="gcont" class="sbs" bind:this={gcont} />
		<div id="depb-content" class="sbs" bind:this={epb} />
	</div>
</div>

<style>
	#content {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		height: 100vh;
	}

	.sbs {
		/* height: 100%;
		flex-grow: 1; */
		width: 500px;
		height: 500px;
	}

	.row {
		flex-grow: 0.5;
		height: 100%;

		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}
</style>
