Game.Map = function(tiles) {
	this._tiles = tiles;
	//cache width & height based on length of tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;
};

//getters
Game.Map.prototype.getWidth = function() {
	return this._width;
};
Game.Map.prototype.getHeight = function() {
	return this._height;
};

//gets tile for a given coord. set
Game.Map.prototype.getTile = function(x, y) {
	//make sure we're are inside bounds
	//if not, return null
	if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
		return Game.Tile.nullTile;
	} else {
		return this._tiles[x][y] || Game.Tile.nullTile;
	}
};