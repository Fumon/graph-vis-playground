<script>
	import cytoscape from 'cytoscape';
	import { default as cyCanvas } from 'cytoscape-canvas';
	import { edgePathBundling } from '$lib/epb';
	import { onMount } from 'svelte';

	import { wellknown_datasets_array } from '$lib/convert/well-known.js';
	import { HSLToRGB, edgePointsToWDs, paperAssignColor } from '$lib/cyto/quick';

	import Victor from 'victor';

	/**
	 * @type {HTMLDivElement}
	 */
	let gcont;
	let epb;

	const default_data = 'cubes1';
	const datasets = wellknown_datasets_array;
	let dataset_index = datasets.findIndex((e) => e.name == default_data);

	const edge_drawing_default = 'default';
	const edge_drawing_method = [{ name: 'default', layer: false }];
	let edge_drawing_index = edge_drawing_method.findIndex((e) => e.name == edge_drawing_default);

	let cy;
	let bcy;
	let directed = false;

	function edgeAngleToColor(e) {
		const s = Victor.fromObject(e.source().position());
		const t = Victor.fromObject(e.target().position());

		const angle = t.clone().subtract(s).angleDeg();

		return `rgb(${HSLToRGB(angle, 55, 40)})`;
	}

	function paperAngleToColor(e) {
		return paperAssignColor(e.source().position(), e.target().position());
	}

	function node_drawing_style() {
		return {
			selector: 'node',
			style: {
				'background-color': '#666',
				// label: 'data(id)',
				width: 0.5,
				height: 0.5
			}
		};
	}

	function edge_drawing_style() {
		return {
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
		};
	}

	function updateCy(graphdata) {
		if (cy !== undefined) {
			cy.unmount();
			cy.destroy();
		}

		cy = cytoscape({
			container: gcont,
			elements: graphdata,

			style: [
				// the stylesheet for the graph
				node_drawing_style(),
				edge_drawing_style()
			],

			layout: {
				name: 'preset'
			}
		});
	}

	function tweak(obj, fn) {
		fn(obj);
		return obj;
	}

	function updateBcy() {
		if (bcy !== undefined) {
			bcy.unmount();
			bcy.destroy();
		}

		const k = 1.8;
		const d = 2;

		console.time('ControlP');
		edgePathBundling(cy, k, d, directed);
		console.timeEnd('ControlP');

		const c1json = cy.json();
		bcy = cytoscape({
			container: epb,
			elements: c1json.elements,
			style: [
				node_drawing_style(),
				tweak(edge_drawing_style(), (o) => (o.selector = 'edge[controlPointCount < 1]')),
				tweak(edge_drawing_style(), (o) => {
					o.selector = 'edge[controlPointCount > 0]';
					o.style['curve-style'] = 'unbundled-bezier';
					o.style['control-point-distances'] = (e) =>
						edgePointsToWDs(e, e.data('controlPoints').slice(1, -2)).d;
					o.style['control-point-weights'] = (e) =>
						edgePointsToWDs(e, e.data('controlPoints').slice(1, -2)).w;
					o.style['edge-distances'] = 'node-position';
				})
			],
			layout: {
				name: 'preset'
			},
			zoom: c1json.zoom,
			pan: c1json.pan
		});
	}

	function updateDatasetHandler(event) {
		dataset_index = event.target.value;
		updateCy(datasets[dataset_index].data);
	}
	function updateDirectedHandler(event) {
		directed = event.target.value === 'true' ? true : false;
	}
	function updateEdgeDrawingHandler(event) {
		edge_drawing_index = event.target.value;
	}

	onMount(() => {
		cytoscape.use(cyCanvas);
		updateCy(datasets[dataset_index].data);
		// cy.on('position', (event) => {
		// 	updateBcy();
		// });
	});
</script>

<div id="content">
	Edge Path Bundling Test
	<div class="toolbar">
		<fieldset on:change={updateDatasetHandler}>
			<legend>Select a dataset:</legend>

			{#each datasets as dataset, i}
				{#if i == dataset_index}
					<input type="radio" id={dataset.name} name="dataset" value={i} checked />
				{:else}
					<input type="radio" id={dataset.name} name="dataset" value={i} />
				{/if}
				<label for={dataset.name}>{dataset.name}</label>
			{/each}
		</fieldset>
		<fieldset on:change={updateDirectedHandler}>
			<legend>Directed:</legend>
			<input type="radio" id="directed-false" name="directed" value={'false'} checked />
			<label for="directed-false">false</label>
			<input type="radio" id="directed-true" name="directed" value={'true'} />
			<label for="directed-true">true</label>
		</fieldset>
		<fieldset on:change={updateEdgeDrawingHandler}>
			<legend>Drawing Method:</legend>

			{#each edge_drawing_method as drawing_method, i}
				{#if i == edge_drawing_index}
					<input type="radio" id={drawing_method.name} name="drawing_method" value={i} checked />
				{:else}
					<input type="radio" id={drawing_method.name} name="drawing_method" value={i} />
				{/if}
				<label for={drawing_method.name}>{drawing_method.name}</label>
			{/each}
		</fieldset>
		<button on:click={updateBcy}>Update bcy</button>
	</div>

	<div class="row">
		<div id="gcont" class="sbs" bind:this={gcont} />
		<div id="depb-content" class="sbs" bind:this={epb} />
	</div>
</div>

<style>
	:global(html),
	:global(body),
	#content {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
	}

	.toolbar {
		box-sizing: border-box;
		height: 20%;
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
	}

	.sbs {
		flex: 1 1 100%;
	}

	.row {
		box-sizing: border-box;
		width: 100%;
		height: 80%;

		display: flex;
		flex-direction: row;
		/* flex-wrap: nowrap; */
	}

	.row * {
		box-sizing: inherit;
	}
</style>
