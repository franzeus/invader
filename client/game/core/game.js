Game = {

    debug : false,

    init : function() {
        Session.set('current_level', 0);
        World.init();
    },

    start : function(game_id) {
        World.show();
        var levelIndex = Session.get('current_level');
        this.loadLevel(levelIndex);
    },

    exit : function() {
        World.hide();
        Session.set('lobbyViewVisible', true);
        Session.set('gameId', null);
        return this;
    },

    loadLevel : function(levelIndex, callback) {

        Meteor.call('getLevel', levelIndex, function(error, level) {

            if (level) {
                var gameId = Session.get('game_id');
                var player = getCurrentPlayer();

                var invaders = Players.find({
                    game_id : gameId,
                    type : PlayerManager.INVADER
                }).fetch();

                var seekers = Players.find({
                    game_id : gameId,
                    type : PlayerManager.SEEKER
                }).fetch();

                World.build(level, player._id, invaders, seekers);
            }

            if (typeof callback === 'function') {
                callback();
            }

        });
    }
};