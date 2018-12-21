const CAPACITY_SLEIGH = 10000000;
const MAX_LAT = 90;     // y
const MAX_LON = 180;    // x
const START_LAT = 68.073611;
const START_LON = 29.315278;
var STATUS;
var CAPACITY_QUADRANT = CAPACITY_SLEIGH * 5;
var CAPACITY_QUADRANT_SILDER;
var quadrants = new Array();
var presents = new Array();
var index = 0;
var table;

async function preload() {
    if (!geoCheck()) throw 'geolocation.p5.js not available';

    STATUS = 'loading';

    // load present data
    table = loadTable('./presents.csv', 'header', function() {
        STATUS = 'idle';
    });
}

function setup() {
    createCanvas(1200, 600);

    CAPACITY_QUADRANT_SILDER = createSlider(CAPACITY_SLEIGH, CAPACITY_SLEIGH * 100, CAPACITY_SLEIGH * 10, CAPACITY_SLEIGH);
    CAPACITY_QUADRANT_SILDER.position(10, 10);
    CAPACITY_QUADRANT_SILDER.style('width', '80px');
}

function draw() {
    background(0);
    

    switch(STATUS) {
        case 'idle':
            var lastQuadrant = CAPACITY_QUADRANT;
            CAPACITY_QUADRANT = CAPACITY_QUADRANT_SILDER.value();
            if (lastQuadrant !== CAPACITY_QUADRANT) {
                dividePackages();
            }

            index++;
            for (var i = 0; i < quadrants.length; i++) {
                let quadrant = quadrants[i];
                quadrant.draw();
            }
            break;
        case 'dividing':
            if (index !== 0) index = 0;
            break;
    }

    stroke(255, 0, 0);
    strokeWeight(5);
    var x = map(START_LON, -MAX_LON, MAX_LON, 0, width - 1);
    var y = map(START_LAT, -MAX_LAT, MAX_LAT, height - 1, 0);
    point(x, y);
}

function dividePackages() {
    STATUS =  'dividing';
    quadrants = new Array();
    quadrants.push(new Quadrant(-MAX_LAT, -MAX_LON, MAX_LAT, MAX_LON));
    var planRoute = this.planRoute;

    table.rows.forEach((row, index) => {
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

        // last row
        if (index === table.getRowCount() - 1) {
            STATUS = 'idle';
            planRoute();
        }
    });
}

// this function should be asynchronously adding to a list called route
// each trip he makes the list should update, storing the package inices, their coordinates and the weight delivered
function planRoute() {
    // we have a list of quadrants
    // we would like to get the closest quadrant that isn't done
    var planningQuadrants = quadrants.slice().sort(function(a, b) {
        return a.distance - b.distance;
    });

    // todo look at traveling salesman algorithms
    for (let i = 0; i < planningQuadrants.length; i++) {
        let curq = planningQuadrants[i]; // currentQuadrant
        // so we need to get the two sides facing away from santa's house
        // then we need to get the quadrants that lie next to these faces

        // for the currentQuadrant, get all the outer quadrants as well (behind from santa's perspective)
        // get the closest present from the currentQuadrant
        // score all other presents in the currentQuadrant and the outer quadrants depending on distance and weight
        // deliver the one with the best score
        // add the present to the route and look again from that present

        // if there are no presents that would fit in weightwise
        // check if there are any presents on the way back to santa's house that would fit
        // deliver any that fit as well (sorted by extra distance score)

        // go back to santa's house
        // start working on the next planningQuadrant
        // continue until all quadrants are done        
    }

    // we are done, now we should store these parameters and the list to a file (e.g. DISTANCE/CAPACITY_QUADRANT.route.json)
    // these files should also be indexed at startup of the program
    // these should be sorted by distance at any given point in time (distance per kg delivered)
    // now we can compare the parameters we're using at the moment
    // to all other runs
    // we can see now which ones are better than others
    // we could adjust parameters using a machine learning algorithm based on the resulting distance
    // e.g. we could adjust the CAPACITY_QUADRANT and the presentscoring algorithm parameters with machine learning
    // this way we will hopefully find out the best parameters for the quadrant method
}

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }