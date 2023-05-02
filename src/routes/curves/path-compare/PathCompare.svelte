<script>
	import CanvasGrid from "$lib/components/CanvasGrid.svelte";
    import { bspline } from "$lib/splines/basismatrixspline";
	import { debug } from "svelte/internal";

	const controlpoints = [
		[0.1, 0.5],
        [0.2, 0.8],
        [0.4, 0.2],
        [0.5, 0.8],
        [0.6, 0.2],
        [0.7, 1.0],
		[0.9, 0.5]
	].map((arr) => ({ x: arr[0], y: arr[1] }));

    const thickness = 4;
    const color = "green";
    const approx = 100;

	function straight(controlpoints_px, ct) {
        const cp0 = controlpoints_px[0];
        ct.moveTo(cp0.x, cp0.y);

        controlpoints_px.slice(1).forEach((pt) => {
            ct.lineTo(pt.x, pt.y);
        })

        ct.lineWidth=thickness;
        ct.strokeStyle = color;
        ct.stroke();
    }

    function curved_bspline(controlpoints_px, ct) {

        const controlpoints_px_arr = [controlpoints_px[0], ...controlpoints_px, controlpoints_px[controlpoints_px.length - 1]].map((pt) => [pt.x, pt.y])
        const points = bspline(controlpoints_px_arr, approx);

        // debugger;
        ct.moveTo(points[0][0], points[0][1]);
        
        points.slice(1, -2).forEach((pt) => {
            ct.lineTo(pt[0], pt[1]);
        });

        ct.lineWidth=thickness;
        ct.strokeStyle = color;
        ct.stroke();
    }

	function methodWrapper(method) {
		return function (canvasElem) {
			const h = canvasElem.height;
			const w = canvasElem.width;
			const ct = canvasElem.getContext('2d');

			const controlpoints_px = controlpoints.map((pt) => ({ x: pt.x * w, y: pt.y * h }));

            method(controlpoints_px, ct);
		};
	}

    const canvas_demos = [
        {name: "straight", f: methodWrapper(straight)},
        {name: "b-spline", f: methodWrapper(curved_bspline)},
    ];
</script>

<CanvasGrid canvases={canvas_demos}></CanvasGrid>
