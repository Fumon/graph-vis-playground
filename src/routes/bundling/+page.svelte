<script>
	import cytoscape from 'cytoscape';
	import { default as cyCanvas } from 'cytoscape-canvas';
	cytoscape.use(cyCanvas);

	import { edgePathBundling } from '$lib/epb';
	import { onMount } from 'svelte';

	import { wellknown_datasets_array } from '$lib/convert/well-known.js';
	import { HSLToRGB, edgePointsToWDs, paperAssignColor } from '$lib/cyto/quick';

	import Victor from 'victor';
	import { bspline } from '$lib/splines/basismatrixspline';

	let gcont;
	let epb;

	const default_data = 'cubes2';
	const datasets = wellknown_datasets_array;
	let dataset_index = datasets.findIndex((e) => e.name == default_data);
	$: picked_dataset = datasets[dataset_index];
	$: {
		updateCy(picked_dataset.data);
	}

	const edge_drawing_default = 'default';
	const edge_drawing_method = [
		{ name: 'default', layer: false, layerf: null },
		{ name: 'b-spline', layer: true, layerf: canvas_bspline }
	];
	let edge_drawing_index = edge_drawing_method.findIndex((e) => e.name == edge_drawing_default);
	$: picked_edge_drawing_method = edge_drawing_method[edge_drawing_index];

	let directed = false;

	let cy;
	let bcy;

	function edgeAngleToColor(e) {
		const s = Victor.fromObject(e.source().position());
		const t = Victor.fromObject(e.target().position());

		const angle = t.clone().subtract(s).angleDeg();

		return `hsl(${angle}, 55%, 40%)`;
	}

	function paperAngleToColor(e) {
		return paperAssignColor(e.source().position(), e.target().position());
	}

	function default_node_style() {
		return {
			selector: 'node',
			style: {
				// label: 'data(id)',
				'background-color': '#666',
				width: 0.5,
				height: 0.5
			}
		};
	}

	function default_edge_style() {
		return {
			selector: 'edge',
			style: {
				// label: 'data(id)',
				width: 0.2,
				'line-color': paperAngleToColor,
				'line-opacity': 0.4,
				'curve-style': 'straight'
				// 'target-arrow-color': '#c3c',
				// 'target-arrow-shape': 'triangle',
			}
		};
	}

	function null_edge_style() {
		return {
			selector: 'edge',
			style: {
				// label: 'data(id)',
				width: 0.0,
				// 'line-color': paperAngleToColor,
				'line-opacity': 0.0,
				'curve-style': 'straight'
				// 'target-arrow-color': '#c3c',
				// 'target-arrow-shape': 'triangle',
			}
		};
	}

	function create_joining_endpoints(cp) {
		const cs = Victor.fromObject(cp[0]);
		const cs_succ = Victor.fromObject(cp[0]);
		const ct = Victor.fromObject(cp[cp.length - 1]);
		const ct_prev = Victor.fromObject(cp[cp.length - 2]);

		function create_mirrored_point(pt, mpt) {
			const out = mpt.clone().add(mpt.clone().subtract(pt));
			debugger;
			return out;
		}

		return [create_mirrored_point(cs_succ, cs), ...cp, create_mirrored_point(ct_prev, ct)];
	}

	function canvas_bspline(edgedata, ct) {
		const edge_style = default_edge_style();
		const edge_opacity = edge_style.style['line-opacity'];
		edgedata.forEach((edge) => {
			const s = edge.source().position();
			const t = edge.target().position();

			ct.beginPath();
			ct.lineWidth = edge_style.style.width;
			const color = edge_style.style['line-color'](edge);
			ct.strokeStyle = color;
			ct.globalAlpha = edge_opacity;

			const control_points = edge.data('controlPoints');
			if (control_points !== null) {
				const points = bspline(
					create_joining_endpoints(control_points).map((pt) => [pt.x, pt.y]),
					100
				);

				points.slice(1, -2).forEach((pt) => {
					ct.lineTo(pt[0], pt[1]);
				});
			} else {
				ct.moveTo(s.x, s.y);
				ct.lineTo(t.x, t.y);
			}

			// ct.lineTo(t.x, t.y);

			// ct.strokeStyle = 'rgb(255, 0, 0, 0.2)';

			ct.stroke();
			ct.globalAlpha = 1.0;
		});
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
				default_node_style(),
				default_edge_style()
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
				default_node_style(),
				...(picked_edge_drawing_method.layer
					? [null_edge_style()]
					: [
							tweak(default_edge_style(), (o) => (o.selector = 'edge[controlPointCount < 1]')),
							tweak(default_edge_style(), (o) => {
								o.selector = 'edge[controlPointCount > 0]';
								o.style['curve-style'] = 'unbundled-bezier';
								o.style['control-point-distances'] = (e) =>
									edgePointsToWDs(e, e.data('controlPoints').slice(1, -2)).d;
								o.style['control-point-weights'] = (e) =>
									edgePointsToWDs(e, e.data('controlPoints').slice(1, -2)).w;
								o.style['edge-distances'] = 'node-position';
							})
					  ])
			],
			layout: {
				name: 'preset'
			},
			zoom: c1json.zoom,
			pan: c1json.pan
		});

		if (picked_edge_drawing_method.layer) {
			const layer = bcy.cyCanvas();
			const canvas = layer.getCanvas();
			const ctx = canvas.getContext('2d');

			bcy.on('render', (evt) => {
				layer.clear(ctx);
				layer.setTransform(ctx);
				picked_edge_drawing_method.layerf(bcy.edges(), ctx);
				layer.resetTransform(ctx);
			});
		}
	}
</script>

<div id="content">
	Edge Path Bundling Test
	<div class="toolbar">
		<fieldset>
			<legend>Select a dataset:</legend>

			{#each datasets as dataset, i}
				<label>
					<input type="radio" bind:group={dataset_index} name="dataset" value={i} />
					{dataset.name}
				</label>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Directed:</legend>
			{#each [true, false] as val}
				<label>
					<input type="radio" bind:group={directed} name="directed" value={val} />
					{val}
				</label>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Drawing Method:</legend>

			{#each edge_drawing_method as drawing_method, i}
				<label>
					<input type="radio" bind:group={edge_drawing_index} name="drawing_method" value={i} />
					{drawing_method.name}
				</label>
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
