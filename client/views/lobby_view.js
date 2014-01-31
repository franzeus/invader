createAndJoinGame = function() {
    if (Session.get('game_id') === null) {
        var player_id = Session.get('player_id');
        var game_id = GameManager.create(player_id);
        GameManager.enter(game_id, player_id);
    }
};

// -----------------------------
// LOBBY TEMPLATE
// -----------------------------
Template.lobby.isVisible = function() {
    return Session.get('player_id') !== null && Session.get('game_id') === null;
};

Template.lobby.events({
    'click .createGameButton' : function(e) {
        createAndJoinGame();
    },

    'click .joinGame' : function() {
        GameManager.enter(this._id, Session.get('player_id'));
    },

    'click .joinSeeker' : function() {
        PlayerManager.setPlayerType(Session.get('player_id'), PlayerManager.SEEKER);
    },

    'click .joinInvader' : function() {
        PlayerManager.setPlayerType(Session.get('player_id'), PlayerManager.INVADER);
    }
});

// -----------------------------
// OPEN GAMES TEMPLATE
// -----------------------------
Template.openGames.games = function() {
    return Games.find({ is_playing : false }, { $sort : { timestampe : -1} });
};

// -----------------------------
// PLAYERS TEMPLATE
// -----------------------------
Template.players.invaders = function() {
    return Players.find({ game_id : null, type : 5 });
};

Template.players.seekers = function() {
    return Players.find({ game_id : null, type : 6 });
};

Template.players.isNotCurrentPlayer = function(player) {
    return Session.equals('player_id', player._id);
};

Template.players.isInvader = function() {
    return Session.equals('player_type', PlayerManager.INVADER);
};

Template.players.isSeeker = function() {
    return Session.equals('player_type', PlayerManager.SEEKER);
};