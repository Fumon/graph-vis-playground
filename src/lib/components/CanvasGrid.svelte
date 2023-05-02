<script>
	import { onMount } from 'svelte';
	import { afterUpdate } from 'svelte';

	let canvasContainer;
	let canvases = ['straight', 'curvy', 'curly', 'curvy squared'];
	let canvasspecs = canvases.map((name) => ({ name: name }));
	let canvaselements = {};


  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

	function updateCanvasDims() {
		canvasspecs.forEach((c) => {
			const elem = canvaselements[c.name];
            // debugger;
			elem.width = elem.parentElement.clientWidth;
            elem.height = elem.parentElement.clientHeight;
		});
	}

    const debouncedUpdate = debounce(updateCanvasDims, 150);
    function handleResize() {
        debouncedUpdate();
    }

	onMount(() => {
        window.addEventListener('resize', handleResize);
        updateCanvasDims();
    });

    afterUpdate(() => {
        updateCanvasDims();
    });
</script>

<div class="canvas-container" bind:this={canvasContainer}>
	{#each canvasspecs as canvas (canvas.name)}
		<div class="canvas-wrapper">
			<div class="canvasbox">
				<canvas id="canvas-{canvas.name}" bind:this={canvaselements[canvas.name]} />
				<div class="canvas-label">{canvas.name}</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.canvas-container {
		display: flex;
		flex-direction: column;
		/* align-content: flex-start; */
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}
	.canvas-wrapper {
		box-sizing: border-box;
		padding: 5px;
		flex: 0 0 33.3333%;
		justify-content: center;
		align-items: center;
		/* border: 4px dashed black; */
	}
	.canvasbox {
        position: relative;
		width: 100%;
		height: 100%;
	}
	.canvas-label {
        box-sizing: border-box;
		position: absolute;
		top: 0;
		left: 0;
		padding: 5px;
		background-color: rgba(0, 0, 0, 0.5);
		color: #fff;
		font-weight: bold;
	}
	canvas {
		box-sizing: border-box;
		border: 2px dashed blue;
	}
</style>
