const CAPACITY_SLEIGH = 10000000;
const CAPACITY_QUADRANT = CAPACITY_SLEIGH * 5;
const MAX_LAT = 90;     // y
const MAX_LON = 180;    // x
var quadrants = new Array();
var presents = new Array();
var index = 0;
var table;

async function preload() {
    if (!geoCheck()) throw 'geolocation.p5.js not available';

    // load present data
    table = loadTable('./presents.csv', 'header');
    // wait for the full csv to be loaded
    while (table.rows.length < 10000) await sleep(100);

    quadrants.push(new Quadrant(-MAX_LAT, -MAX_LON, MAX_LAT, MAX_LON));

    table.rows.forEach(row => {
        let obj = row.obj;
        let present = new Present(parseInt(obj.id), parseFloat(obj.lat), parseFloat(obj.lon), parseInt(obj.weight));
        let splitQuadrants;
        for (let i = 0; i < quadrants.length; i++) {
            if (quadrants[i].presentInside(present)) {
                quadrants[i].presents.push(present);
                if (quadrants[i].full()) {
                    splitQuadrants = quadrants[i].split();
                    quadrants.splice(i, 1);
                    break;
                }
            }
        }
        
        if (splitQuadrants) {
            for (let i = 0; i < splitQuadrants.length; i++) {
                let quadrant = splitQuadrants[i];
                quadrants.push(quadrant);
            }
        }
    });
}

function setup() {
    createCanvas(1200, 600);
}

function draw() {
    background(0);
    

    index++;
    for (var i = 0; i < quadrants.length; i++) {
        let quadrant = quadrants[i];
        quadrant.draw();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}