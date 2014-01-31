GameManager = {

    create : function(player_id) {

        if (!player_id) throw "Can not create game without a player_id"

        var id = Games.insert({
            creator_id : player_id,
            players : [],
            timestamp : (new Date()).getTime(),
            is_playing : false
        });

        return id;
    },

    update : function(game_id, properties) {
        Games.update({ _id : game_id }, properties);
    },

    enter : function(game_id, player_id) {

        if (this.isPlayerInGame(game_id, player_id)) {

            console.info("Player is already in game");

        } else if (this.gameIsPlaying(game_id)) {

            console.info("Game is already running");

        } else {

            var statement = {
                $push : { players : player_id }
            };
            this.update(game_id, statement);

            PlayerManager.enterGame(game_id, player_id);

        }

    },

    leave : function(game_id, player_id) {

        if (this.isPlayerInGame(game_id, player_id)) {
            var statement = {
                $pull : { players : player_id }
            };
            this.update(game_id, statement);

            PlayerManager.leaveGame(player_id);

            // No players left, remove it
            if (this.amountOfPlayers(game_id) === 0) {
                this.remove(game_id);
            }
        } else {
            console.info("Can not leave - player is not in this game");
        }

    },

    remove : function(game_id) {
        // TODO check if players are still in it
        Games.remove({ _id : game_id });
    },

    amountOfPlayers : function(game_id) {
        return Games.findOne({ _id : game_id }).players.length || 0;
    },

    start : function(game_id) {

        if (this.gameHasEnoughPlayersToStart(game_id)) {

            var statement = {
                $set : { is_playing : true }
            };
            this.update(game_id, statement);

            // TODO: for each player, set in_game to true
            //var players = Players.find({ game_id : game_id}).fetch();
        }
    },

    stop : function(game_id) {
        var statement = {
            $set : { is_playing : false }
        };
        this.update(game_id, statement);

        PlayerManager.setInGame(false);
        // TODO: for each player, set in_game to false
    },

    isPlayerInGame : function(game_id, player_id) {
        var game = Games.findOne({ _id : game_id });
        var isInGame = false;

        if (game) {
            isInGame = game.players.indexOf(player_id) > -1;
        }

        return isInGame;
    },

    clear : function() {
        var games = Games.find({}).fetch();
        for (var i = 0; i < games.length; i++) {
            Games.remove({ _id : games[i]._id });
        }
    },

    gameHasEnoughPlayersToStart : function(game_id) {
        var invaders = Players.find({ game_id : game_id, type : PlayerManager.INVADER}).count();
        var seekers = Players.find({ game_id : game_id, type : PlayerManager.SEEKER}).count();

        return (invaders > 0 && seekers > 0);
    },

    gameIsPlaying : function(game_id) {
        return Games.findOne(game_id).is_playing;
    }


};