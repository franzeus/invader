PlayerTile = function(_options) {
    Tile.apply(this, arguments);

    // Id in mongodb collection
    this.collectionId = null;

    this.currentRow = this.row;
    this.currentCol = this.col;
    this.nextTile = null;
    this.radiusShape = null;
    this.hasRadius = Session.equals('PlayerTile_type', 6);

    this.isPlayer = false;
    this.isVisible = true;
    this.isMoveable = true;
    this.isPassable = false;

    this.moveQueue = [];
    this.lastMoveToX = null;
    this.lastMoveToY = null;

    this.velocity = 10;
    this.radius = World.tileSize * 4;
    this.color = "#50126D";
};

PlayerTile.prototype = new Tile();

PlayerTile.prototype.drawShape = function() {
    this.shape = World.snap.rect(this.x, this.y, this.size, this.size);
    this.shape.attr({
        fill: this.color,
        stroke: "#CCC",
        strokeWidth: 0
    });

    this.drawRadius();

    return this.shape;
};

PlayerTile.prototype.initMove = function() {
    this.nextTile = this.popQueue();

    if (this.nextTile) {
        this.move(this.nextTile);
    }
};

PlayerTile.prototype.move = function(tile) {

    if (this.lastMoveToX === tile.x && this.lastMoveToY === tile.y) return;

    // IF inAnimation, then stop the current animation
    var currentAnimation = this.shape.inAnim();
    if (currentAnimation.length) {

        var lastAnimation = currentAnimation[0];
        lastAnimation.stop();
        this.x = this.shape.attr('x');
        this.y = this.shape.attr('y');
        tile.unhighlight();

        if (this.radiusShape) {
            var radiusAnimation = this.radiusShape.inAnim();
            if (radiusAnimation) {
                radiusAnimation[0].stop();
            }
        }
    }

    if (this.isPlayer) {
        this.triggerMove(tile);
    }

    var distance = Math.round( Math.sqrt( Math.pow((tile.x - this.x), 2) + Math.pow((tile.y - this.y), 2)) );
    var time = this.velocity * distance;

    var self = this;

    if (this.radiusShape) {
        var tileCenter = tile.getMiddlePoint();
        this.radiusShape.animate({
            cx : tileCenter.x,
            cy : tileCenter.y
        }, time, function() {

        });
    }

    this.shape.animate({
        x : tile.x,
        y : tile.y
    }, time, function() {
        self.x = tile.x;
        self.y = tile.y;
        self.currentRow = tile.row;
        self.currentCol = tile.col;
        self.initMove();
        tile.unhighlight();
    });

    this.lastMoveToX = tile.x;
    this.lastMoveToY = tile.y;
};

PlayerTile.prototype.triggerMove = function(tile) {

    Players.update({
        _id : this.collectionId,
    }, {
        $set : {
            row : tile.row,
            col : tile.col
        }
    });

};

PlayerTile.prototype.rotateTo = function(tile) {

    var angle = 45;
    var middlePoint = this.getMiddlePoint();
    var centerX = center.x; // this.shape.attr('x') + this.size / 2;
    var centerY = center.y; //this.shape.attr('y') + this.size / 2;

    var rotation = new Snap.Matrix();
    rotation.rotate(angle, centerX, centerY);
    this.shape.transform(rotation);
};

PlayerTile.prototype.getTileCoord = function() {
    return this.currentRow + '_' + this.currentCol;
};

PlayerTile.prototype.drawRadius = function() {
    return;
};

// ------------------------------------
Seeker = function(_options) {
    PlayerTile.apply(this, arguments);
    this.PlayerTileType = 6;
    this.showMasked = true;
};
Seeker.prototype = new PlayerTile();
Seeker.prototype.drawRadius = function() {

    var center = this.getMiddlePoint();
    this.radiusShape = World.snap.circle(center.x, center.y, this.radius);

    if (this.showMasked && this.isPlayer) {

        this.radiusShape.attr({
            x : center.x,
            y : center.y,
            fill: 'r()#FFF-#111'
        });

        World.snap.select('#layerGame').attr({
            mask: this.radiusShape
        });

    } else {

        this.radiusShape.attr({
            x : center.x,
            y : center.y,
            fill: 'none',
            stroke: '#FF0000',
            strokeWidth : 1
        });
    }
};

// ------------------------------------
Invader = function(_options) {
    PlayerTile.apply(this, arguments);
    this.color = '#2980b9';
    this.PlayerTileType = 5;
};
Invader.prototype = new PlayerTile();