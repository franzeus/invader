/**
* Following methods are shared between client and server
*/
Meteor.methods({

	/**
	* Returns a level by index
	*
	* @return {Object}
	*/
	getLevel : function(index) {

		var level = null;

		if (index < levels.length) {
			level = levels[index];
		}

		return level;
	},

	startLevel : function(index) {

		// Start countdown

	},

});