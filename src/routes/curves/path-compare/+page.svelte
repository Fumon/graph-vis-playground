

<script>
    import CanvasGrid from "$lib/components/CanvasGrid.svelte";
	import PathCompare from "./PathCompare.svelte";
</script>


<style>
    :global(html),
    :global(body),
    #main {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
    }
    .toolbar {
        box-sizing: border-box;
        background-clip: content-box;
        padding: 5px;
        height: 20%;
        background-color: #ccc;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .canvas-grid {
        height: 80%;
    }
    
</style>

<div id="main">
    <div class="toolbar">
        <h4>Toolbar</h4>
    </div>
    <div class="canvas-grid">
        <PathCompare />
    </div>
</div>
