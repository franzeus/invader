PlayerManager = {

    INVADER : 5,
    SEEKER  : 6,

    create : function(name, type) {

        if (!name) return;
        type = parseInt(type, 10);

        if (!type) {
            type = this.getRandomType();
        }

        var id = Players.insert({
            name: name,
            type: type,
            is_in_game : false,
            game_id: null,
            timestamp : (new Date()).getTime(),
            row : null,
            col : null,
            wins : 0,
            losses : 0
        });

        Session.set('player_id', id);
        Session.set('player_type', type);

    },

    update : function(id, statement) {
        Players.update({ _id : id }, statement);
    },

    remove : function(id) {
        Players.remove({ _id : id });
    },

    enterGame : function(game_id, player_id) {
        Session.set('game_id', game_id);
        this.update(player_id, {
            $set: { game_id : game_id, is_in_game : true }
        });
    },

    leaveGame : function(player_id) {
        Session.set('game_id', null);
        this.update(player_id, {
            $set: { game_id : null, is_in_game : false }
        });
    },

    clear : function() {
        var players = Players.find({}).fetch();
        for (var i = 0; i < players.length; i++) {
            Players.remove({ _id : players[i]._id });
        }
    },

    setPlayerType : function(player_id, type) {
        type = parseInt(type, 10);
        this.update(player_id, {
            $set : { type : type }
        });
        Session.set('player_type', type);
    },

    setInGame : function(state) {
        Session.set('player_is_playing', state);
    },

    getRandomType : function() {

        var invaders = Players.find({ type : this.INVADER }).count();
        var seekers = Players.find({ type : this.SEEKER }).count();

        if (!invaders && !seekers) {
            return this.INVADER;
        } else {
            // To keep the balance
            return invaders >= seekers ? this.SEEKER : this.INVADER;
        }
    },

}