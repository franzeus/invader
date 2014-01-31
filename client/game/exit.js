Exit = function(_options) {
    Tile.apply(this, arguments);

    this.isPassable = true;
    this.isMoveable = false;
};

Exit.prototype = new Tile();

Exit.prototype.drawShape = function() {
    this.shape = World.snap.rect(this.x, this.y, this.size, this.size);
    this.shape.attr({
        fill: "#FF8500",
        stroke: "#CCC",
        strokeWidth: 0
    });

    var center = this.getMiddlePoint();
    var text = World.snap.text(center.x - 15, center.y + 5, "Exit");
    text.attr({
        fill : '#FFF'
    });
    this.shapeGroup.add(text);
};