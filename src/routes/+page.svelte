
<script>
    import cytoscape from "cytoscape";
	import { onMount } from "svelte";
    
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

  // Easing of the animation for animate:'end'
  animationEasing: 'ease-out',

  // The duration of the animation for animate:'end'
  animationDuration: 2000,

  // The layout animates only after this many milliseconds for animate:true
  // (prevents flashing on fast runs)
  animationThreshold: 50,

  // Number of iterations between consecutive screen positions update
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Excludes the label when calculating node bounding boxes for the layout algorithm
  nodeDimensionsIncludeLabels: false,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 40,

//   // Node repulsion (non overlapping) multiplier
//   nodeRepulsion: function( node ){ return 2048; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 4,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 32; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 32; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 1.2,

  // Gravity force (constant)
  gravity: 1,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 1000,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.99,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0
},
    ];

    let cy;

    onMount(() => {
        cy = cytoscape({
            container: gcont,
            elements: [
                {
                    data: {id: 'a'},
                },
                {
                    data: {id: 'b'}
                },
                {
                    data: {id: 'ab', source: 'a', target: 'b'},
                },
            ],

            style: [ // the stylesheet for the graph
                {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'label': 'data(id)'
                }
                },

                {
                selector: 'edge',
                style: {
                    'width': 3,
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
            },
        });
    });

    function addNode() {
        const rndn = Math.random() * 10000;

        cy.add([
            {
                data: {id: `c${rndn}`}
            },
            {
                data: {id: `c${rndn}b`, source: `c${rndn}`, target:'b'}
            },
        ]);
    }

    function updateLayout(index) {
        let l = cy.layout(layouts[index]);
        l.run();
    }

    function updateLayoutHandler(event) {
        updateLayout(event.target.value);
    }
    
</script>


<h1>Welcome to CytoTest</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>



<div id="nodesbar" class="hbar"><button on:click={addNode}>Add Something</button></div>
<div id="layoutsbar" class="hbar"><fieldset on:change={updateLayoutHandler}>
    <legend>Select a layout:</legend>

    {#each layouts as layout, i}
    {#if false}
    <input type="radio" id={layout.name} name="layout" value={i} checked/>
    {:else}
    <input type="radio" id={layout.name} name="layout" value={i}/>
    {/if}
    <label for={layout.name}>{layout.name}</label>
    {/each}
</fieldset>
</div>

<div id="gcont" bind:this={gcont}></div>

<style>
    #gcont {
        min-height:500px;
        height:100%;
    }
</style>