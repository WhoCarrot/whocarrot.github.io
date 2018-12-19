class Quadrant {
    constructor(fromLat, fromLon, toLat, toLon) {
        // top left
        this.fromLat = fromLat;
        this.fromLon = fromLon;
        // bottom right
        this.toLat = toLat;
        this.toLon = toLon;

        this.presents = new Array();
    }

    presentInside(present) {
        return present.lat >= this.fromLat
            && present.lon >= this.fromLon
            && present.lat <= this.toLat
            && present.lon <= this.toLon;
    }

    full() {
        var sum = 0;
        this.presents.forEach(present => sum += present.weight);
        return sum > CAPACITY_QUADRANT;
    }

    split() {
        var presents = this.presents;

        // split quadrant into four quadrants
        var latCenter = this.fromLat < 0
            ? (this.fromLat + this.toLat) / 2
            : this.fromLat + (this.toLat - this.fromLat) / 2;

        var lonCenter = this.fromLon < 0
            ? (this.fromLon + this.toLon) / 2
            : this.fromLon + (this.toLon - this.fromLon) / 2;


        var quadrants = [
            new Quadrant(this.fromLat, this.fromLon, latCenter, lonCenter), // top left to center center (top left)
            new Quadrant(this.fromLat, lonCenter, latCenter, this.toLon), // top center to right center (top right)
            new Quadrant(latCenter, this.fromLon, this.toLat, lonCenter), // left center to bottom center (bottom left)
            new Quadrant(latCenter, lonCenter, this.toLat, this.toLon) // center center to right bottom (bottom right)
        ];

        // divide big quadrant presents over four new quadrants
        var presents = presents.slice();
        var addedCount = 0;
        presents.forEach(present => {
            quadrants.forEach(quadrant => {
                
                var x1 = map(quadrant.fromLon, -MAX_LON, MAX_LON, 0, width - 1);
                var y1 = map(quadrant.fromLat, -MAX_LAT, MAX_LAT, 0, height - 1);
                
                var x2 = map(quadrant.toLon, -MAX_LON, MAX_LON, 0, width - 1);
                var y2 = map(quadrant.toLat, -MAX_LAT, MAX_LAT, 0, height - 1);
                var xCenter = (x2 - x1) / 2;
                var yCenter = (y2 - y1) / 2;
                // console.log(x1, y1, x2, y2, xCenter, yCenter);
                // noLoop();
                if (quadrant.presentInside(present)) {
                    quadrant.presents.push(present);
                    addedCount++;
                    return;
                }
            });
        });
        // if (presents.length !== addedCount) throw 'Error in split algorithm ' + presents.length + ' <> ' + addedCount;

        // return new quadrants
        return quadrants;
    }

    draw() {
        stroke(255, 0, 0);
        noFill();

        // map the lat & long to x and y coordinates in the screen
        var x1 = map(this.fromLon, -MAX_LON, MAX_LON, 0, width - 1);
        var y1 = map(this.fromLat, -MAX_LAT, MAX_LAT, 0, height - 1);
        
        var x2 = map(this.toLon, -MAX_LON, MAX_LON, 0, width - 1);
        var y2 = map(this.toLat, -MAX_LAT, MAX_LAT, 0, height - 1);

        // find center and place amount
        var xCenter = x1 + (x2 - x1) / 2;
        var yCenter = y1 + (y2 - y1) / 2;
        strokeWeight(1);
        text(this.presents.length, xCenter, yCenter);
        
        beginShape();
        vertex(x1, y1);
        vertex(x1, y2);
        vertex(x2, y2);
        vertex(x2, y1);
        endShape();

        this.presents.forEach(p => p.draw());
    }
}