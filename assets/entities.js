//create mixins namespace
Game.Mixins = {};

//define moveable mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		//check if we can walk on tile
		if (tile.isWalkable()) {
			//update entity's position
			this._x = x; 
			this._y = y;
			return true;
		}
		return false;
	}
}

Game.PlayerTemplate = {
	character: "$",
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Moveable]
}