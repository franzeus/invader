/*
  =======================================================
  CLIENT
  =======================================================
*/
clear = function() {
  PlayerManager.clear();
  GameManager.clear();
}

if (Meteor.isClient) {

  Session.set('player_id', null);
  Session.set('game_id', null);
  Session.set('player_is_playing', false);

  jQuery(document).ready(function() {
    Game.init();
  });

}

/*
  =======================================================
  SERVER
  =======================================================
*/

if (Meteor.isServer) {
  Meteor.startup(function () {
  });
}