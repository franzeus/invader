Template.game_lobby.isVisible = function() {
    return Session.get('player_id') !== null &&
            Session.get('game_id') !== null &&
            Session.get('player_is_playing') === false;
};

Template.game_lobby.joinedPlayers = function() {
    var currentPlayer = getCurrentPlayer();
    return getAllPlayersByGameId(currentPlayer.game_id);
};

Template.game_lobby.canStartGame = function() {
    return GameManager.gameHasEnoughPlayersToStart(Session.get('game_id'));
};

Template.game_lobby.events({

    'click .leaveGameButton' : function() {
        GameManager.leave(Session.get('game_id'), Session.get('player_id'));
    },

    'click .startGameButton' : function() {
        GameManager.start(Session.get('game_id'));
    }

});
