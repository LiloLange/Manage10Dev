export function getMassCenter(readings, row, col) {
    let massCenter = Object();
    let mass = 0;
    let massR = 0;
    let massC = 0;
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            massR += readings[r * col + c] * (r);
            massC += readings[r * col + c] * (c);
            mass += readings[r * col + c];
        }
    }
    if (mass != 0) {
        massCenter.r = massR / mass;
        massCenter.c = massC / mass;
    } else {
        massCenter.r = null;
        massCenter.c = null;
    }
    return massCenter;

}

export function Smoothing(readings, row, col) {
    function gR(c, r) {
        let val = 0;
        if (c < 0 || c >= col || r < 0 || r >= row) {
            val = 0;
        } else {
            val = readings[r * col + c];
        }
        return val;
    }

    let out = [];
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            out[r * col + c] = Math.round((gR(c-1, r-1) + gR(c, r-1) + gR(c+1,r-1) + gR(c-1, r) + gR(c, r) + gR(c+1, r) + gR(c-1, r+1) + gR(c, r+1) + gR(c+1, r+1)) / 9);


        }
    }



    return out;
}

export function Normalize(readings) {
    let max = 1;
    let out = [];
    for (let i = 0; i < readings.length; i++) {
        if (readings[i] > max) max = readings[i];
    }
    for (let i = 0; i < readings.length; i++) {
        out[i] = Math.round(readings[i] * 65535 / max);
    }
    return out;
}

export function getMaximums(readings, massCenter, row, col) {
    function sortByK(a, b) {
        if (a.k > b.k) return -1;
        if (a.k < b.k) return 1;
    }
    let out = [];
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            let item = new Object();
            item.r = r;
            item.c = c;
            item.v = readings[r * col + c];
            item.dist = Math.sqrt((massCenter.r - r) * (massCenter.r - r) + (massCenter.c - c) * (massCenter.c - c));
            item.k = item.v - (item.dist * 2000) + (15000 - Math.abs(r - (row / 2)) * 15000);

            if (item.v > 50000) {
                out.push(item);
            }
        }
    }

    out.sort(sortByK);
    return out;
}

export function getMaximumsShoulder(readings, massCenter, row, col) {
    function sortByK(a, b) {
        if (a.k > b.k) return -1;
        if (a.k < b.k) return 1;
    }
    let out = [];
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            let dr = r;
            if (r > row / 2) dr -= row /2;
            let K = (row / 4 - Math.abs(dr - (row / 4))) / (row / 4);
            //console.log('R: ' + r +'; K: ' + K);
            let item = new Object();
            item.r = r;
            item.c = c;
            item.v = readings[r * col + c];
            //item.dist = Math.sqrt((massCenter.r - r) * (massCenter.r - r) + (massCenter.c - c) * (massCenter.c - c));
            item.k = item.v  + K * 55000;

            if (item.k > 40000) {
                out.push(item);
            }
        }
    }

    out.sort(sortByK);
    return out;
}

export function getVectors(readings, maxCenter, row, col) {
    function gR(c, r) {
        let val = 0;
        if (c < 0 || c >= col || r < 0 || r >= row) {
            val = 0;
        } else {
            val = readings[r * col + c];
        }
        return val;
    }
    function inner(f00, f10, f01, f11, x, y) {
        let un_x = 1.0 - x; let un_y = 1.0 - y;
        return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    }

    let step = 0.1;
    let out = [];

    //console.log(readings[maxCenter.r * col + maxCenter.c]);
    let minValue = readings[maxCenter.r * col + maxCenter.c] * 0.30; //35%

    for (let deg = 0; deg < 360; deg++) {
        let L = step;
        let val = 65535;
        let vec = new Object();
        while (val > minValue) {
            vec.x = maxCenter.c + (L * Math.cos(deg * Math.PI / 180));
            vec.y = maxCenter.r + (L * Math.sin(deg * Math.PI / 180));
            let c = Math.trunc(vec.x);
            let r = Math.trunc(vec.y);

            let p00 = gR(c, r);
            let p10 = gR(c+1, r);
            let p01 = gR(c, r+1);
            let p11 = gR(c+1, r+1);
            let x = vec.x - c;
            let y = vec.y - r;

            val = inner(p00, p10, p01, p11, x, y);




            //val = 0;
            L += step;
        }
        vec.l = L;
        out.push(vec);
    }
    return out;
}

export function getStats(vectors) {
    function SortL(a, b) {
        if (a.l > b.l) return 1;
        if (a.l < b.l) return -1;
    }
    let stat = new Object();
    stat.L_ave = 0;
    stat.L_min = vectors[0].l;
    stat.L_max = vectors[0].l;
    stat.L_med = 0;
    stat.L_sum = 0;
    for (let i = 0; i < vectors.length; i++) {
        stat.L_sum += vectors[i].l;
        if (vectors[i].l > stat.L_max) stat.L_max = vectors[i].l;
        if (vectors[i].l < stat.L_min) stat.L_min = vectors[i].l;
    }
    stat.L_ave = stat.L_sum / vectors.length;
    vectors.sort(SortL);
    stat.L_med = vectors[Math.round(vectors.length / 2)].l;
    return stat;
}

export function isInside(maximum, vectors) {
    let bottomR = vectors[0].y;
    let topR = vectors[0].y;
    for (let i = 0; i < vectors.length; i++) {
        if (vectors[i].y > topR) topR = vectors[i].y;
        if (vectors[i].y < bottomR) bottomR = vectors[i].y;
    }
    return (maximum.r < topR && maximum.r > bottomR);
}