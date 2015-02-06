Game.Map = function(tiles, player) {
	this._tiles = tiles;
	//cache width & height based on length of tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;
	//a list to hold entities
	this._entities = [];
	//engine & scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	//add the player
	this.addEntity(player);
	//add random fungi
	for (var i = 0; i < 1000; i++) {
		this.addEntity(new Game.Entity(Game.FungusTemplate));
	}
};

//getters
Game.Map.prototype.getEngine = function() {
	return this._engine;
}
Game.Map.prototype.getEntities = function() {
	return this._entities;
}
Game.Map.prototype.getEntityAt = function(x, y) {
	//iterates through all searching for matching coord
	for (var i = 0; i < this._entities.length; i++) {
		if (this._entities[i].getX() == x && this._entities[i].getY() == y) {
			return this._entities[i];
		}
	}
	return false;
}
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

Game.Map.prototype.dig = function(x, y) {
	//if tile is diggable, updated the floor
	if (this.getTile(x, y).isDiggable()) {
		this._tiles[x][y] = Game.Tile.floorTile;
	}
}

Game.Map.prototype.getRandomFloorPosition = function() {
	//generate rando tile which is floor
	var x, y;
	do {
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while (this.getTile(x, y) != Game.Tile.floorTile || 
					this.getEntityAt(x, y));
	return {x: x, y: y };
}

Game.Map.prototype.addEntity = function(entity) {
	//make entity's position within bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
			entity.getY() < 0 || entity.getY() >= this._height) {
		throw new Error('Adding entity out of bounds.');
	}
	//update entity's map
	entity.setMap(this);
	//Add entity to list of entities
	this._entities.push(entity);
	//check if entity is actor, add to scheduler
	if (entity.hasMixin('Actor')) {
		this._scheduler.add(entity, true);
	}
}
