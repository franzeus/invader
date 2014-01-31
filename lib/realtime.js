Games   = new Meteor.Collection("games");
Players = new Meteor.Collection("players");

getCurrentPlayer = function () {
  return Players.findOne(Session.get('player_id'));
};

getAllPlayersByGameId = function(game_id) {
    return Players.find({game_id : game_id, is_in_game : true});
};

getPlayersInLobby = function(game_id) {
    return Players.find({is_in_game : false});
};

getGameById = function(game_id) {
    return Games.findOne({_id : game_id});
};



// ===================
// CLIENT
// ===================
if (Meteor.isClient) {

    Deps.autorun(function () {

        Meteor.subscribe('players');

        if (Session.get('player_id')) {

            var me = getCurrentPlayer();

            if (me && me.game_id) {
                Meteor.subscribe('players_ingame', me.game_id);
                Meteor.subscribe('games', me.game_id);

                // When player is in the game lobby and someone press game start
                // then the game starts for every player
                if (!Session.get('player_is_playing')) {
                    var game = getGameById(me.game_id);
                    if (game && game.is_playing) {
                        PlayerManager.setInGame(true);
                        Game.start(game._id);
                    }
                }

                var obs = Players.find({game_id : me.game_id, is_in_game : true});
                obs.observeChanges({
                    changed: function (id, fields) {

                        if (fields.hasOwnProperty('row') || fields.hasOwnProperty('col')) {
                            World.syncMove(id, fields);
                        }

                    }
                });

            }

        }

    });

}


// ===================
// SERVER
// ===================
if (Meteor.isServer) {

    Meteor.publish('players', getPlayersInLobby);

    // publish single games
    Meteor.publish("games", getGameById);

    // publish all players in game
    Meteor.publish('players_ingame', getAllPlayersByGameId);

}