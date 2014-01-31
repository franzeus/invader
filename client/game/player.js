Player = function(collectionId) {
    this.collectionId = collectionId;
    this.tile = null;
};

Player.getType = function() {
    return Session.get('player_type');
};