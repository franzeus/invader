Wall = function(_options) {
    Tile.apply(this, arguments);

    this.isPassable = false;
    this.isMoveable = false;
};

Wall.prototype = new Tile();

Wall.prototype.drawShape = function() {
    this.shape = World.snap.rect(this.x, this.y, this.size, this.size);
    this.shape.attr({
        fill: "#333",
        stroke: "#CCC",
        strokeWidth: 0
    });
};