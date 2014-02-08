Tile = function(_options) {

    if (!_options) {
        return;
    }

    this.type = null;

    this.row = _options.row;
    this.col = _options.col;
    this.size = _options.size;

    this.x = this.size * this.col;
    this.y = this.size * this.row;

    this.shape = null;
    this.shapeGroup = World.snap.g();
    this.color = "#E5E5E5";
    this.strokeColor = "#CCC";
    this.strokeWidth = 0;

    this.isVisible = true;
    this.isMoveable = false;
    this.isPassable = true;

    this.underlayingTile = null;

    this.queue = [];

    jQuery.extend(this, _options);
};

Tile.prototype.draw = function() {

    this.drawShape();
    this.shapeGroup.add(this.shape);

    if (Game.debug) {
        this.drawCenterPoint();
        this.drawCoords();
    }

    return this;
};

Tile.prototype.drawCenterPoint = function() {
    var center = this.getMiddlePoint();
    this.centerPoint = World.snap.circle(center.x, center.y, 1);
    this.centerPoint.attr({
        fill : "#00FF00",
        'class' : 'debugInfo'
    });

    this.shapeGroup.add(this.centerPoint);

    return this.centerPoint;
};

Tile.prototype.drawCoords = function() {
    var text = World.snap.text(this.x, this.y + 10, this.row + "|" + this.col);
    text.attr({
        fill : '#FF0000',
        fontSize : '8px',
        'class' : 'debugInfo'
    });
    //this.shape.before(text);
    this.shapeGroup.add(text);
    return this;
};

Tile.prototype.update = function() {
    return this;
};

Tile.prototype.getMiddlePoint = function() {
    return { x: this.x + this.size / 2, y : this.y + this.size / 2 };
};

Tile.prototype.bindEvents = function() {

    if (this.shape) {

        var self = this;

        this.shape.click(function () {
            self.onClick.call(self, false);
        });

    }

    return this;
};

Tile.prototype.pushQueue = function(tiles) {

    // Still tiles in queue
    var tilesInQueue = this.queue.length
    if (tilesInQueue) {
        for (var i = 0; i < tilesInQueue; i++) {
            this.queue[i].unhighlight();
        }
    }

    this.queue = [];

    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        tile.highlight();
        this.queue.push(tile);
    }

    return this;
};

Tile.prototype.popQueue = function() {
    var tile = null;

    if (this.queue.length) {
        tile = this.queue.pop();
    }

    return tile;
};

Tile.prototype.onClick = function() {
    if (this.underlayingTile) {
         World.onClickTile(this.underlayingTile);
    } else {
        World.onClickTile(this);
    }
};

Tile.prototype.getTileCoord = function() {
    return this.row + '_' + this.col;
};

Tile.prototype.collidedWithTile = function(otherTile) {
    return;
};