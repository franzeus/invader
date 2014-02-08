PlayerTile = function(_options) {
    Tile.apply(this, arguments);

    // Id in mongodb collection
    this.collectionId = null;

    this.currentRow = this.row;
    this.currentCol = this.col;
    this.nextTile = null;
    this.radiusShape = null;

    this.isPlayer = false;
    this.isVisible = true;
    this.isMoveable = true;
    this.isPassable = false;

    this.moveQueue = [];
    this.lastMoveToX = null;
    this.lastMoveToY = null;

    this.velocity = 10;
    this.radiusInGrid = 4;
    this.radius = World.tileSize * (this.radiusInGrid);
    this.color = "#50126D";

    this.trackedPlayers = {};
    this.hasReachedExit = false;
    this.hasBeenCaught = false;
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

PlayerTile.prototype.isInactive = function() {
    return this.hasReachedExit || this.hasBeenCaught;
};

PlayerTile.prototype.initMove = function() {
    this.nextTile = this.popQueue();

    if (this.nextTile) {
        this.move(this.nextTile);
    }
};

PlayerTile.prototype.move = function(tile) {

    if ((this.lastMoveToX === tile.x &&
        this.lastMoveToY === tile.y) ||
        this.isInactive()) {
        return;
    }
    var self = this;

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

    // Tell other players in game we have moved our own player tile
    if (this.isPlayer) {
        this.triggerMove(tile);
    }

    var distance = Math.round( Math.sqrt( Math.pow((tile.x - this.x), 2) + Math.pow((tile.y - this.y), 2)) );
    // TODO: Fix when screen is bigger it will take longer than on a smaller device
    // (Maybe: velocity = tileSize / x)
    var time = this.velocity * distance;

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
        self.collidedWithTile.call(self, tile);
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

PlayerTile.prototype.collidedWithTile = function(otherTile) {
    return;
};

PlayerTile.prototype.startInRadiusCheck = function() {

    if (this.isInactive()) return;

    var self = this;
    setTimeout(function() {
        self.playerInRadius();
        self.startInRadiusCheck();
    }, 100);
};

PlayerTile.prototype.playerInRadius = function() {
    var num = World.playerTiles.length;

    for (var i = 0; i < num; i++) {
        var playerTile = World.playerTiles[i];

        if (playerTile.type !== this.type && !playerTile.hasReachedExit && !playerTile.hasBeenCaught) {

            var minRowInRadius = this.currentRow - this.radiusInGrid;
            var maxRowInRadius = this.currentRow + this.radiusInGrid;
            var minColInRadius = this.currentCol - this.radiusInGrid;
            var maxColInRadius = this.currentCol + this.radiusInGrid;

            if (minRowInRadius < playerTile.currentRow && playerTile.currentRow < maxRowInRadius &&
                minColInRadius < playerTile.currentCol && playerTile.currentCol < maxColInRadius) {
                this.handleTracking(playerTile);
            } else {
                this.removeFromTracking(playerTile);
            }

        }

    };
};

PlayerTile.prototype.handleTracking = function(otherPlayer) {

    if (otherPlayer.hasBeenCaught || otherPlayer.hasReachedExit) return;

    var collectionId = otherPlayer.collectionId;
    var trackedObject = this.trackedPlayers[collectionId];

    if (!trackedObject) {
        this.trackedPlayers[collectionId] = 1;
    } else {
        this.trackedPlayers[collectionId] = trackedObject + 1;
    }

    if (this.trackedPlayers[collectionId] >= 30) {
        this.setCatched(otherPlayer);
        otherPlayer.setCatched(this);
    }
};

PlayerTile.prototype.removeFromTracking = function(otherPlayer) {
    if (this.trackedPlayers[otherPlayer.collectionId]) {
        delete this.trackedPlayers[otherPlayer.collectionId];
    }
};

// ------------------------------------
// SEEKER
// ------------------------------------
Seeker = function(_options) {
    PlayerTile.apply(this, arguments);
    this.type = PlayerManager.SEEKER;
    this.showMasked = true;
    this.startInRadiusCheck();
    this.playersCaught = [];
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

Seeker.prototype.setCatched = function(catchedPlayerTile) {
    this.playersCaught.push(catchedPlayerTile.collectionId);
    this.removeFromTracking(catchedPlayerTile);
};

// ------------------------------------
// INVADER
// ------------------------------------
Invader = function(_options) {
    PlayerTile.apply(this, arguments);
    this.color = '#2980b9';
    this.type = PlayerManager.INVADER;
    this.startInRadiusCheck();
};
Invader.prototype = new PlayerTile();

Invader.prototype.collidedWithTile = function(otherTile) {

    if (this.hasCollidedWithExitTile()) {
        World.invaderReachedExitTile(this);
        this.hasReachedExit = true;
    }

};

// Returns true if this tile has collided with an exit tile
Invader.prototype.hasCollidedWithExitTile = function() {

    var hasReachedExit = false;
    for (var i = 0; i < World.exitTiles.length; i++) {

        var currentExitTile = World.exitTiles[i];

        if (currentExitTile.row === this.currentRow &&
            currentExitTile.col === this.currentCol) {
                hasReachedExit = true;
                break;
        }

    }

    return hasReachedExit;
};

Invader.prototype.setCatched = function(fromPlayerTile) {
    this.hasBeenCaught = true;
    console.log('Catched invader');
};