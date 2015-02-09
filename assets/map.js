Game.Map = function(tiles, player) {
	this._tiles = tiles;
	
	//cache dimensions
	this._depth = tiles.length
	this._width = tiles[0].length;
	this._height = tiles[0][0].length;

	//setup filed of vision
	this._fov = [];
	this.setupFov();
	
	//a list to hold entities
	this._entities = [];
	
	//engine & scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	
	//add the player
	this.addEntityAtRandomPosition(player, 0);
	
	//add random fungi
	for (var z = 0; z < this.depth; z++) {
		for (var i = 0; i < 25; i++) {
			this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate), z);
		}		
	}
};

//getters

Game.Map.prototype.setupFov = function() {
	//keep this in 'map' 
	var map = this;
	//iterate through each depth, set up FOV
	for (var z = 0; z < this._depth; z++) {
		console.log(this._depth);
		//we have to precent depth from being hoisted out of the loop
		console.log('hi: ', z);
		(function() {
			//each depth, create callback to sort out light-passing per tile
			var depth = z;
			map._fov.push(
				new ROT.FOV.DiscreteShadowcasting(function(x, y) {
					return !map.getTile(x, y, depth).isBlockingLight();
				}, {topology: 4}));
		})();
	}
}

Game.Map.prototype.getFov = function(depth) {
	return this._fov[depth];
}

Game.Map.prototype.getDepth = function() {
	return this._depth;
};

Game.Map.prototype.getWidth = function() {
	return this._width;
};

Game.Map.prototype.getHeight = function() {
	return this._height;
};

//gets tile for a given coord. set
Game.Map.prototype.getTile = function(x, y, z) {
	//make sure we're are inside bounds
	//if not, return null
	if (x < 0 || x >= this._width || y < 0 || y >= this._height ||
			z < 0 || z >= this._depth) {
		return Game.Tile.nullTile;
	} else {
		return this._tiles[z][x][y] || Game.Tile.nullTile;
	}
};



Game.Map.prototype.getEngine = function() {
	return this._engine;
};

Game.Map.prototype.getEntities = function() {
	return this._entities;
};

Game.Map.prototype.getEntityAt = function(x, y, z) {
	//iterates through all searching for matching coord
	for (var i = 0; i < this._entities.length; i++) {
		if (this._entities[i].getX() == x && this._entities[i].getY() == y &&
				this._entities[i].getZ() == z) {
			return this._entities[i];
		}
	}
	return false;
};



Game.Map.prototype.dig = function(x, y, z) {
	//if tile is diggable, updated the floor
	if (this.getTile(x, y, z).isDiggable()) {
		this._tiles[z][x][y] = Game.Tile.floorTile;
	}
}

Game.Map.prototype.getRandomFloorPosition = function() {
	//generate rando tile which is floor
	var x, y, z;
	do {
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
		z = Math.floor(Math.random() * this._depth);

	} while (!this.isEmptyFloor(x, y, z));
	return {x: x, y: y, z: z};
}

Game.Map.prototype.addEntity = function(entity) {
	//make entity's position within bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
			entity.getY() < 0 || entity.getY() >= this._height ||
			entity.getZ() < 0 || entity.getZ() >= this._depth) {
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

Game.Map.prototype.removeEntity = function(entity) {
	//find entity in list of entities if it is present
	for (var i = 0; i < this._entities.length; i++) {
		if (this._entities[i] == entity) {
			this._entities.splice(i, 1);
			break;
		}
	}
	//if the entity is an actor, remove from play
	if (entity.hasMixin('Actor')) {
		this._scheduler.remove(entity);
	}
}

Game.Map.prototype.addEntityAtRandomPosition = function(entity, z) {
	var position = this.getRandomFloorPosition(z);
	entity.setX(position.x);
	entity.setY(position.y);
	entity.setZ(position.z);
	this.addEntity(entity);
}

Game.Map.prototype.isEmptyFloor = function(x, y, z) {
	//check if tile is floor and also has no entity
	return this.getTile(x, y, z) == Game.Tile.floorTile &&
		!this.getEntityAt(x, y, z);
}

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, 
																											centerZ, radius) {
	results = [];
	//determine bounds
	var leftX = centerX - radius;
	var rightX = centerX + radius;
	var topY = centerY - radius;
	var bottomY = centerY + radius;
	//iterate throught entities adding any in range
	for (var i = 0; i < this._entities.length; i++) {
		if (this._entities[i].getX() >= leftX &&
			this._entities[i].getX() <= rightX &&
			this._entities[i].getY() >= topY &&
			this._entities[i].getY() <= bottomY &&
			this._entities[i].getZ() == centerZ) {
			results.push(this._entities[i]);
		}
	}
	return results;
}

