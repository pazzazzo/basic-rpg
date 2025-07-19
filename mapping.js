const { createNoise2D } = require('simplex-noise');
const Alea = require('alea')
const prng = new Alea('seed');

const riverNoise = createNoise2D(prng)
const treeNoise = createNoise2D(prng)

const WIDTH = 80;
const HEIGHT = 40;
const RIVER_SCALE = 60;
const RIVER_WIDTH = 0.04;
const TREE_SCALE = 10;
const TREE_THRESHOLD = 0.6;

function generateMap(width, height, offsetX = 0, offsetY = 0) {
    const map = Array.from({ length: height }, () => Array(width));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const r = riverNoise((x + offsetX) / RIVER_SCALE, (y + offsetY) / RIVER_SCALE);
            if (Math.abs(r) < RIVER_WIDTH) {
                map[y][x] = 'river';
                continue;
            }

            const t = treeNoise((x + offsetX) / TREE_SCALE, (y + offsetY) / TREE_SCALE);
            if (t > TREE_THRESHOLD) {
                map[y][x] = 'tree';
            } else {
                map[y][x] = 'ground';
            }
        }
    }

    return map;
}

const legend = { water: 'W', river: 'R', ground: '.', tree: 'T' };

let terrain
let i = 0

setInterval(() => {
    terrain = generateMap(WIDTH, HEIGHT, 0, HEIGHT * i);
    terrain.forEach(row =>
        console.log(row.map(cell => legend[cell]).join(''))
    );
    i++
}, 500);