/**
*   - Collision detection: Invader-Seeker, Invader-Exit
*   - Improve path finding
*   - Sprite animation
*   - Rotation of player
*   - GameLobby: Check how many players are supported by level
*   - Provide leave game (when in-game)
*   - Highscore
*   - Chat
*   - Level editor
*/
World = {

    width : 0,
    height : 0,
    tileSize : 0,
    canvasId : '#world',
    snap : null,
    currentMap : [],

    fixObjects : [],
    moveableObjects : [],
    floors : [],
    exitTiles : [],

    layerIdPrefix : 'layer',
    isVisibleKey : 'isWorldVisible',

    player : null,
    playerTiles : [],
    invadersInExit : [],
    numbersOfInvaders : 0,
    numbersOfSeekers : 0,

    startSyn : false,

    easystar : null,
    graph : {},

    // Sorted by layer-index
    objectDict : {
        0 : 'Floor',
        1 : 'Wall',
        3 : 'Exit',
        5 : 'Invader',
        6 : 'Seeker'
    },

    init : function() {

        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;

        this.width = screenWidth;
        this.height = screenHeight;

        this.snap = Snap(this.canvasId);
        this.createLayers();

        return this;
    },

    setupEasystar : function() {
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.currentMap);
        this.easystar.setAcceptableTiles([0]);
    },

    createLayers : function() {

        var gameLayer = this.snap.g();
        gameLayer.node.id = 'layerGame';

        for(key in this.objectDict) {
            var layer = this.snap.g();
            layer.node.id = this.layerIdPrefix + key;
            gameLayer.add(layer);
        }

    },

    setSize : function() {

        this.numberOfCols = this.currentMap.length;
        this.numberOfRows = this.currentMap[0].length;

        this.tileSize = Math.floor( Math.min( (this.width / this.numberOfRows), (this.height / this.numberOfCols) ) );

        // Bring world to center of the screen and
        // set world size
        var $world = jQuery(this.canvasId);
        var totalWidth = this.numberOfRows * this.tileSize;
        var totalHeight = this.numberOfCols * this.tileSize;
        var marginLeft = (this.width - totalWidth) / 2;
        var marginTop = (this.height - totalHeight) / 2;

        $world.css({
            'margin-left' : marginLeft + 'px',
            'margin-top' : marginTop + 'px',
            width : totalWidth + 'px',
            height : totalHeight + 'px'
        });

        return this;
    },

    build : function(level, player_id, invaders, seekers) {

        this.currentMap = level.tileMap;
        this.setSize();
        this.numbersOfInvaders = invaders.length;
        this.numbersOfSeekers = seekers.length;

        for (var r = 0; r < this.currentMap.length; r++) {
             for (var c = 0; c < this.currentMap[r].length; c++) {

                var tileKey = this.currentMap[r][c];
                var currentTile = this.tileFactory(tileKey, r, c);

                // Add floor if necessary
                if (currentTile.isMoveable || currentTile.isPassable || !currentTile.isVisible) {
                    var floorTile = this.tileFactory(0, r, c);
                    this.setFloorTileEdges(floorTile, r, c, this.currentMap);
                    floorTile.draw().bindEvents();
                    this.snap.select('#' + this.layerIdPrefix + '0').add(floorTile.shapeGroup);
                    currentTile.underlayingTile = floorTile;
                }

                //lastTile = (r === this.currentMap.length - 1) && (c === this.currentMap[r].length - 1) ? currentTile : null;

                if (tileKey === 0) {
                    this.setFloorTileEdges(currentTile, r, c, this.currentMap);
                    this.floors.push(currentTile);
                }

                // Exit tile
                if (tileKey === 3) {
                    this.exitTiles.push(currentTile);
                }

                // INVADER
                if (tileKey === 5) {
                    var player = invaders.pop();
                    this.setPlayer(player._id, currentTile, r, c, player_id);
                }

                // SEEKER
                if (tileKey === 6) {
                    var player = seekers.pop();
                    this.setPlayer(player._id, currentTile, r, c, player_id);
                }

                currentTile.draw().bindEvents();
                this.snap.select('#' + this.layerIdPrefix + tileKey).add(currentTile.shapeGroup);
            }

        }

        this.startSyn = true;
        return this;
    },

    setPlayer : function(id, tile, r, c, player_id) {

        Players.update({ _id : id }, { $set : { row : r, col : c } });

        if (player_id !== id) {
            tile.collectionId = id;
            this.playerTiles.push(tile);
        } else {
            this.player = tile;
            this.player.collectionId = player_id;
            this.player.isPlayer = true;
        }

    },

    startPathFinding : function() {
        var self = this;
        Meteor.setInterval(function() {
            self.easystar.calculate();
        }, 60);
    },

    tileFactory : function(tileKey, row, col) {

        var type = this.objectDict[tileKey];

        return new window[type]({
            size : this.tileSize,
            row : row,
            col : col,
            type : type
        });
    },

    setFloorTileEdges : function(tile, rowIndex, colIndex, map) {

        var map = map || this.currentMap;
        var edges = {};
        var distance = 1;
        var rowIndex = rowIndex || tile.row;
        var colIndex = colIndex || tile.col;

        var startRowIndex = Math.max(rowIndex - 1, 0);
        var rowLen = (rowIndex === 0 ? 2 : 3) + startRowIndex;
        var startColIndex = Math.max(colIndex - 1, 0);
        var colLen = (colIndex === 0 ? 2 : 3) + startColIndex;

        var rowOffset = 0;
        var colOffset = 0;

        for (var r = startRowIndex; r < rowLen; r++) {

            var currentRow = map[r];

            // Row exists
            if (currentRow) {

                for (var c = startColIndex; c < colLen; c++) {

                    var currentColKey = map[r][c];

                    /**
                             0 1 2
                             _ _ _
                        0   |_|0|_|
                        1   |0|X|0|
                        2   |_|0|_|
                    */
                    // Its a floor or exit
                    if (currentColKey === 0 || currentColKey === 3) {

                        /*
                        var add = false;

                        if (rowOffset % 2 === 0) {
                            if (colOffset % 2 !== 0) {
                                add = true;
                            }
                        } else {
                            if (colOffset % 2 === 0) {
                                add = true;
                            }
                        }
                        */

                        distance = !(r === rowIndex && c === colIndex) ? 1 : 0;
                        //distance = (r % 2 === 0 && c % 2 === 0) ? 3 : distance;
                        edges[r + '_' + c] = distance;

                        colOffset++;
                    }

                }

                rowOffset++;
            }

        };

        tile.edges = edges;
        var key = rowIndex + '_' + colIndex;
        tile.name = key;
        this.graph[key] = tile;

        return edges;
    },

    onClickTile : function(tile) {

        var self = this;

        if (tile.type === this.objectDict[0] && !this.player.isInactive()) {

            // If the animation is not ready yet, it may happen
            // that not all tiles in queue are reset
            if (this.player.nextTile) {
                this.player.nextTile.unhighlight();
            }

            var playerPos = this.player.getTileCoord();
            var targetPos = tile.getTileCoord();

            var path = Dijkstra.find_path(this.graph, playerPos, targetPos);
            var tiles = this.getTilesByCoord(path);

            // We use tiles.pop, so the order must be reversed
            tiles.reverse();
            // Remove current position
            tiles.pop();

            this.player.pushQueue(tiles).initMove();
        }
    },

    syncMove : function(id, fields) {

        // Syncing the current player is not neccessary
        if (!this.startSyn || this.player.collectionId === id) return;

        var otherPlayer = this.getPlayerTile(id);

        if (otherPlayer) {
            var row = fields.row || otherPlayer.currentRow;
            var col = fields.col || otherPlayer.currentCol;
            var targetTile = this.graph[row + '_' + col];

            if (targetTile) {
                otherPlayer.move(targetTile);
            }
        }

    },

    // Triggered from invader tile when reached exit tile
    invaderReachedExitTile : function(invaderTile) {
        console.log("Invader reached exit tile");
        this.invadersInExit.push(invaderTile);

        // Check if all invaders have won
        if (this.invadersInExit.length === this.numbersOfInvaders) {
            console.log('All invaders have escaped!');
        }
    },

    getPlayerTile : function(collectionId) {
        var player = null;

        for (var i = 0; i < this.playerTiles.length; i++) {

            if (this.playerTiles[i].collectionId === collectionId) {
                player = this.playerTiles[i];
            }
        }

        return player;

    },

    getTilesByCoord : function(path, typeFilter) {
        var tiles = [];

        for (var i = 0; i < path.length; i++) {
            var tile = this.graph[path[i]];
            if (!typeFilter || typeFilter === tile.type) {
                tiles.push(tile);
            }
        }

        return tiles;
    },

    getEasystarPath : function(tile, callback) {

        var startRow = this.player.currentRow;
        var startCol = this.player.currentCol;
        var endRow = tile.row;
        var endCol = tile.col;

        this.easystar.findPath(startRow, startCol, endRow, endCol, function(path) {
            if (path === null) {
                console.log("Path was not found.");
            } else {
                var tiles = self.getTilesByEasystarCoord(path);
                callback(tiles);
            }
        });

    },

     getTilesByEasystarCoord : function(path) {
        var tiles = [];

        for (var i = 0; i < path.length; i++) {
            var tile = this.graph[path[i].x + '_' + path[i].y];
            tiles.push(tile);
        }

        return tiles;
    },

    show : function() {
        Session.set(this.isVisibleKey, true);
        return this;
    },

    hide : function() {
        Session.set(this.isVisibleKey, false);
        return this;
    },

    isVisible : function() {
        return Session.get(this.isVisibleKey);
    }
};