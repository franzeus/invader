Template.playerNameForm.isVisible = function() {
    return Session.equals('player_id', null);
};

Template.playerNameForm.events({

    'submit .playerNameForm' : function(e) {
        var playerName = jQuery('#playerName').val().trim();
        var playerType = jQuery('#playerType input:checked').val().trim();

        if (playerName) {
            PlayerManager.create(playerName, playerType);
        }

        e.preventDefault();
    }

});
