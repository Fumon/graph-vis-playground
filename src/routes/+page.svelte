<script>
	import cytoscape from 'cytoscape';
    import cola from 'cytoscape-cola';
	import { onMount } from 'svelte';

	/**
	 * @type {HTMLDivElement}
	 */
	let gcont;

	const layouts = [
		{
			name: 'random',
			animate: true,
			animationDuration: 1000,
			animationEasing: 'ease-out'
		},
		{
			name: 'cose',

			// Whether to animate while running the layout
			// true : Animate continuously as the layout is running
			// false : Just show the end result
			// 'end' : Animate with the end result, from the initial positions to the end positions
			animate: true,
			animationDuration: 1000,
			animationEasing: 'ease-out',

			// The layout animates only after this many milliseconds for animate:true
			// (prevents flashing on fast runs)
			animationThreshold: 10,
		},
        {
            name: 'cola',
            animate: true,
            maxSimulationTime: 40000,
            refresh: 1,
            // flow: {axis: 'y', minSeparation: 150},
            // edgeJaccardLength: 150,
            avoidOverlap: true,
            // edgeLength: 400,
        }
	];

	let cy;
    let layout;
    let layoutIndex;

	onMount(() => {
        cytoscape.use(cola);
		cy = cytoscape({
			container: gcont,
			elements: [
				{
					data: { group: 'nodes', id: 'a' }
				},
				{
					data: { group: 'nodes', id: 'b' }
				},
				{
					data: { group: 'edges', id: 'ab', source: 'a', target: 'b' }
				}
			],

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
						width: 3,
						'line-color': '#ccc',
						'target-arrow-color': '#ccc',
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier'
					}
				}
			],

			layout: {
				name: 'grid',
				rows: 1
			}
		});
	});

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
        if(layoutIndex !== null) {
            newLayout(layoutIndex);
        }
    }

	function newLayout(index) {
        if(layout !== undefined) {
            layout.stop();
        }
		layout = cy.layout(layouts[index]);
        layout.run();
        layoutIndex = index;
	}

	function updateLayoutHandler(event) {
		newLayout(event.target.value);
	}
</script>

<div id="content">
<h1>Welcome to CytoTest</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

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

<div id="gcont" bind:this={gcont} />
</div>

<style>
    #content {
        display:flex;
        flex-direction: column;
        flex-flow: column;
        height:100vh;
    }

    #gcont {
        flex-grow:1;
		height: 100%;
	}
</style>
