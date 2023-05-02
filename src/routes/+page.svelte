<script>
	import cytoscape from 'cytoscape';
	import cola from 'cytoscape-cola';
	import coseBilkent from 'cytoscape-cose-bilkent';
	import { edgePathBundling } from '$lib/epb';
	import { onMount } from 'svelte';

	import { default as wellknown } from '$lib/convert/well-known.js';
	import { HSLToRGB, edgePointsToWDs, paperAssignColor } from '$lib/cyto/quick';

	import Victor from 'victor';

	const elems = wellknown.airtraffic;

	/**
	 * @type {HTMLDivElement}
	 */
	let gcont;
	let epb;

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

	function edgeAngleToColor(e) {
		const s = Victor.fromObject(e.source().position());
		const t = Victor.fromObject(e.target().position());

		const angle = t.clone().subtract(s).angleDeg();

		return `rgb(${HSLToRGB(angle, 55, 40)})`;
	}

	function paperAngleToColor(e) {
		return paperAssignColor(e.source().position(), e.target().position());
	}

	onMount(() => {
		cytoscape.use(cola);
		cytoscape.use(coseBilkent);

		const graphdata = elems;
		cy = cytoscape({
			container: gcont,
			elements: graphdata,

			style: [
				// the stylesheet for the graph
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						// label: 'data(id)',
						width: 0.5,
						height: 0.5
					}
				},

				{
					selector: 'edge',
					style: {
						width: 0.2,
						'line-color': paperAngleToColor,
						'line-opacity': 0.4,
						// 'target-arrow-color': '#c3c',
						// 'target-arrow-shape': 'triangle',
						'curve-style': 'straight'
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

		// updateBcy();

		// cy.on('position', (event) => {
		// 	updateBcy();
		// });
	});

	function updateBcy() {
		bcy.unmount();
		bcy.destroy();

		const k = 1.8;
		const d = 2;

		console.time('ControlP');
		edgePathBundling(cy, k, d);
		console.timeEnd('ControlP');

		// let controlWDs = {};
		// for(const cp in controlPoints) {
		// 	const {w, d} = edgePointsToWDs(cy.$id(cp), controlPoints[cp]);
		// 	controlWDs[cp] = {w: w.slice(1, -2), d: d.slice(1, -2) };
		// }

		const c1json = cy.json();
		bcy = cytoscape({
			container: epb,
			elements: c1json.elements,
			style: [
				{
					selector: 'node',
					style: {
						'background-color': '#666',
						// label: 'data(id)',
						width: 0.1,
						height: 0.1
					}
				},
				{
					selector: 'edge[controlPointCount < 1]',
					style: {
						width: 0.4,
						'line-color': paperAngleToColor,
						'line-opacity': 0.4,

						'curve-style': 'straight',
						// 'curve-style': 'unbundled-bezier',
						// 'target-arrow-color': 'black',
						// 'target-arrow-shape': 'triangle'
					}
				},
				{
					selector: 'edge[controlPointCount > 0]',
					style: {
						width: 0.4,
						'line-color': paperAngleToColor,
						'line-opacity': 0.4,

						'curve-style': 'unbundled-bezier',
						'control-point-distances': (e) => e.data('controlPoints').d,
						'control-point-weights': (e) => e.data('controlPoints').w,
						'edge-distances': 'node-position'
						// 'curve-style': 'unbundled-bezier',
						// 'target-arrow-color': 'black',
						// 'target-arrow-shape': 'triangle'
					}
				}
			],
			layout: {
				name: 'preset'
			},
			zoom: c1json.zoom,
			pan: c1json.pan
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
		<button on:click={updateBcy}>Update bcy</button>
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
		/* height: 100vh; */
	}

	.sbs {
		/* height: 100%;
		flex-grow: 1; */
		width: 100%;
		height: 1500px;
	}

	.row {
		flex-grow: 0.5;
		height: 100%;

		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
	}
</style>
