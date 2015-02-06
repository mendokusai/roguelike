Game.Tile = function(properties) {
	properties = properties || {};
	//call the glyph constructor
	Game.Glyph.call(this, properties);
	//set up properties
	this._isWalkable = properties['isWalkable'] || false;
	this._isDiggable = properties['isDiggable'] || false;
};
// tiles inherit all functionality from glyphs
Game.Tile.extend(Game.Glyph);

//standard getter
Game.Tile.prototype.isWalkable = function() {
	return this._isWalkable;
}
Game.Tile.prototype.isDiggable = function() {
	return this._isDiggable;
}

// Game.Tile.prototype.getGlyph = function() {
// 	return this._glyph;
// };

// Game.Tile.wallTile = new Game.Tile({
// 	character: "#",
// 	foreground: 'goldenrod',
// 	isDiggable: true
// })


Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
	character: '.',
	isWalkable: true
	});
Game.Tile.wallTile = new Game.Tile({
	character: "#",
	foreground: 'goldenrod',
	isDiggable: true
});