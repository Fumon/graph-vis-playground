export function createSplineFunction(basisMatrix, coefficient) {
    function multiplyMatrices(mat1x4, mat4x4, mat4x1) {
        // Check if the input arrays have the correct lengths
        if (mat1x4.length !== 4 || mat4x4.length !== 16 || mat4x1.length !== 4) {
            throw new Error('Invalid matrix dimensions');
        }

        // Multiply the 1x4 matrix by the 4x4 matrix to get a 1x4 result
        const result1x4 = [];
        for (let i = 0; i < 4; i++) {
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                sum += mat1x4[j] * mat4x4[j * 4 + i];
            }
            result1x4.push(sum);
        }

        // Multiply the 1x4 result by the 4x1 matrix to get a single value
        let finalResult = 0;
        for (let i = 0; i < 4; i++) {
            finalResult += result1x4[i] * mat4x1[i];
        }

        return finalResult;
    }

    function evaluateSpline(t, controlPoints, basisMatrix) {
        // const T = [t * t * t, t * t, t, 1];
        const T = [1, t, t * t, t * t * t];

        const Gx = controlPoints.slice(0, 4).map(point => point[0]);
        const Gy = controlPoints.slice(0, 4).map(point => point[1]);

        const x = multiplyMatrices(T, basisMatrix, Gx);
        const y = multiplyMatrices(T, basisMatrix, Gy);

        return [x, y];
    }

    function calculateSpline(controlPoints, pointsPerSegment) {
        const n = controlPoints.length;
        const points = [];

        for (let i = 0; i < n - 3; i++) {
            for (let j = 0; j < pointsPerSegment; j++) {
                const t = j / pointsPerSegment;
                const point = evaluateSpline(t, controlPoints.slice(i, i + 4), basisMatrix);
                points.push(point);
            }
        }

        // Add the last control point
        points.push(controlPoints[n - 1]);

        return points.map(point => [point[0] * coefficient, point[1] * coefficient]);
    }

    return calculateSpline;
}

const bsplinebasis = { matrix: [1, 4, 1, 0, -3, 0, 3, 0, 3, -6, 3, 0, -1, 3, -3, 1], coef: 1.0 / 6.0 };
export const bspline = createSplineFunction(bsplinebasis.matrix, bsplinebasis.coef);

// // Example usage:
// const basisMatrix = [-0.5, 1.5, -1.5, 0.5,
//     1, -2.5, 2, -0.5, -0.5, 0, 0.5, 0,
//     0, 1, 0, 0
// ];