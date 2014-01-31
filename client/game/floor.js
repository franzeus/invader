Floor = function(_options) {
    Tile.apply(this, arguments);
    this.color = '#E5E5E5';
    this.highlightColor = '#CCCCCC';
};

Floor.prototype = new Tile();

Floor.prototype.drawShape = function() {
    this.shape = World.snap.rect(this.x, this.y, this.size, this.size);
    this.shape.attr({
        fill: this.color,
        stroke: "#CCC",
        strokeWidth: 1
    });
};

Floor.prototype.highlight = function() {
    this.shape.attr({
        fill : this.highlightColor
    });
};

Floor.prototype.unhighlight = function() {
    this.shape.attr({
        fill : this.color
    });
};