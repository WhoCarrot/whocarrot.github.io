class Quadrant {
    constructor(fromLat, fromLon, toLat, toLon) {
        // top left
        this.fromLat = fromLat;
        this.fromLon = fromLon;
        // bottom right
        this.toLat = toLat;
        this.toLon = toLon;

        // calculate distance to your boy from the hood santa
        var lonCenter = this.fromLon + (this.toLon - this.fromLon) / 2;
        var latCenter = this.fromLat + (this.toLat - this.fromLat) / 2;
        this.distance = getDistance(latCenter, lonCenter, START_LAT, START_LON);

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
        presents.forEach(present => {
            quadrants.forEach(quadrant => {
                if (quadrant.presentInside(present)) {
                    quadrant.presents.push(present);
                    return;
                }
            });
        });
        // if (presents.length !== addedCount) throw 'Error in split algorithm ' + presents.length + ' <> ' + addedCount;

        // return new quadrants
        return quadrants;
    }

    draw() {
        strokeWeight(1);
        stroke(0, 255, 0);

        if (this.presents.length === 0 && !this.done) {
            this.done = true;
        } else if (this.done) {
            fill(color(0, 255, 0, 20));
        }

        else noFill();
        // map the lat & long to x and y coordinates in the screen
        var x1 = map(this.fromLon, -MAX_LON, MAX_LON, 0, width - 1);
        var y1 = map(this.fromLat, -MAX_LAT, MAX_LAT, height - 1, 0);
        
        var x2 = map(this.toLon, -MAX_LON, MAX_LON, 0, width - 1);
        var y2 = map(this.toLat, -MAX_LAT, MAX_LAT, height - 1, 0);

        // find center and place amount
        // var xCenter = x1 + (x2 - x1) / 2;
        // var yCenter = y1 + (y2 - y1) / 2;
        // text(this.presents.length, xCenter, yCenter);
        
        beginShape();
        vertex(x1, y1);
        vertex(x1, y2);
        vertex(x2, y2);
        vertex(x2, y1);
        endShape();

        this.presents.forEach(p => p.draw());
    }
}