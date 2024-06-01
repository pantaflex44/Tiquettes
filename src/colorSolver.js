import Color from './color';

class Solver {
    constructor(target) {
        this.target = target;
        this.targetHSL = target.hsl();
        this.reusedColor = new Color(0, 0, 0); // Object pool
    }

    solve() {
        let result = this.solveNarrow(this.solveWide());
        return {
            values: result.values,
            loss: result.loss,
            filter: this.css(result.values),
            value: this.value(result.values)
        };
    }

    solveWide() {
        const A = 5;
        const c = 15;
        const a = [60, 180, 18000, 600, 1.2, 1.2];

        let best = { loss: Infinity };
        for (let i = 0; best.loss > 25 && i < 3; i++) {
            let initial = [50, 20, 3750, 50, 100, 100];
            let result = this.spsa(A, a, c, initial, 1000);
            if (result.loss < best.loss) { best = result; }
        } return best;
    }

    solveNarrow(wide) {
        const A = wide.loss;
        const c = 2;
        const A1 = A + 1;
        const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
        return this.spsa(A, a, c, wide.values, 500);
    }

    spsa(A, a, c, values, iters) {
        const alpha = 1;
        const gamma = 0.16666666666666666;

        let best = null;
        let bestLoss = Infinity;
        let deltas = new Array(6);
        let highArgs = new Array(6);
        let lowArgs = new Array(6);

        for (let k = 0; k < iters; k++) {
            let ck = c / Math.pow(k + 1, gamma);
            for (let i = 0; i < 6; i++) {
                deltas[i] = Math.random() > 0.5 ? 1 : -1;
                highArgs[i] = values[i] + ck * deltas[i];
                lowArgs[i] = values[i] - ck * deltas[i];
            }

            let lossDiff = this.loss(highArgs) - this.loss(lowArgs);
            for (let i = 0; i < 6; i++) {
                let g = lossDiff / (2 * ck) * deltas[i];
                let ak = a[i] / Math.pow(A + k + 1, alpha);
                values[i] = fix(values[i] - ak * g, i);
            }

            let loss = this.loss(values);
            if (loss < bestLoss) { best = values.slice(0); bestLoss = loss; }
        } return { values: best, loss: bestLoss };

        function fix(value, idx) {
            let max = 100;
            if (idx === 2 /* saturate */) { max = 7500; }
            else if (idx === 4 /* brightness */ || idx === 5 /* contrast */) { max = 200; }

            if (idx === 3 /* hue-rotate */) {
                if (value > max) { value = value % max; }
                else if (value < 0) { value = max + value % max; }
            } else if (value < 0) { value = 0; }
            else if (value > max) { value = max; }
            return value;
        }
    }

    loss(filters) { // Argument is array of percentages.
        let color = this.reusedColor;
        color.set(0, 0, 0);

        color.invert(filters[0] / 100);
        color.sepia(filters[1] / 100);
        color.saturate(filters[2] / 100);
        color.hueRotate(filters[3] * 3.6);
        color.brightness(filters[4] / 100);
        color.contrast(filters[5] / 100);

        let colorHSL = color.hsl();
        return Math.abs(color.r - this.target.r)
            + Math.abs(color.g - this.target.g)
            + Math.abs(color.b - this.target.b)
            + Math.abs(colorHSL.h - this.targetHSL.h)
            + Math.abs(colorHSL.s - this.targetHSL.s)
            + Math.abs(colorHSL.l - this.targetHSL.l);
    }

    css(filters) {
        function fmt(idx, multiplier = 1) { return Math.round(filters[idx] * multiplier); }
        return `filter: invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%);`;
    }

    value(filters) {
        function fmt(idx, multiplier = 1) { return Math.round(filters[idx] * multiplier); }
        return `invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%)`;
    }
}

export default Solver;