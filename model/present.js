class Present {
    constructor(id, lat, lon, weight) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.weight = weight;
    }

    draw() {
        stroke(0, 0, 255);
        strokeWeight(3);
        var x = map(this.lon, -MAX_LON, MAX_LON, 0, width - 1);
        var y = map(this.lat, -MAX_LAT, MAX_LAT, 0, height - 1);
        point(x, y)
    }
}