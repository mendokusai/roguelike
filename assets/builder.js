Game.Builder = function(width, height, depth) {
	this._width = width;
	this._height = height;
	this._depth = depth;
	this._tiles = new Array(depth);
	this._regions = new Array(depth);
	//instantiate the arrays to be multidemensional
	for (var z = 0; z < depth; z++) {
		//create a new cave at each level
		this._tiles[z] = this._generateLevel();
		//set up regions array for each depth
		this._regions[z] = new Array(width);
		for (var x = 0; x < width; x++) {
			this._regions[z][x] = new Array(height);
			//fill with zeros
			for (var y = 0; y < height; y++) {
				this._regions[z][x][y] = 0;
			}
		}
	}
	for (var z = 0; z < this._depth; z++) {
			this._setupRegions(z);
		}
		this._connectAllRegions();
};

Game.Builder.prototype.getTiles = function() {
	return this._tiles;
}

Game.Builder.prototype.getDepth = function() {
	return this._depth;
}

Game.Builder.prototype.getWidth = function() {
	return this._width;
}

Game.Builder.prototype.getHeight = function() {
	return this._height;
}

Game.Builder.prototype._generateLevel = function() {
	//create empty map
	var map = new Array(this._width);
	for (var w = 0; w < this._width; w++) {
		map[w] = new Array(this._height);
	}
	//set up cave generator
	var generator = new ROT.Map.Cellular(this._width, this._height);
	generator.randomize(0.5);
	var totalIterations = 3;
	//iteratively smoothen the map
	for (var i = 0; i < totalIterations - 1; i++) {
		generator.create();
	}
	//smoothen again and update
	generator.create(function(x, y, v) {
		if (v === 1) {
			map[x][y] = Game.Tile.floorTile;
		} else {
			map[x][y] = Game.Tile.wallTile;
		}
	});
	return map;
};

Game.Builder.prototype._canFillRegion = function(x, y, z) {
	//confirm tile is within bounds
	if (x < 0 || y < 0 || z < 0 || x >= this._width ||
		y >= this._height || z >= this._depth) {
		return false;
	}
	//confirm tile does not have region
	if (this._regions[z][x][y] != 0) {
		return false;
	}
	//confirm tile is walkable
	return this._tiles[z][x][y].isWalkable();
}

Game.Builder.prototype._fillRegion = function(region, x, y, z) {
	var tilesFilled = 1;
	var tiles = [{x:x, y:y}];
	var tile;
	var neighbors;
	//update region of original tile
	this._regions[z][x][y] = region;
	//keep looping until tiles are all processed
	while (tiles.length > 0) {
		tile = tiles.pop();
		//get neighbors of tile
		neighbors = Game.getNeighborPositions(tile.x, tile.y);
		//iterate trhough each neighbor
		//check if we can use it to fill && update region list
		while (neighbors.length > 0) {
			tile = neighbors.pop();
			if (this._canFillRegion(tile.x, tile.y, z)) {
					this._regions[z][tile.x][tile.y] = region;
					tiles.push(tile);
					tilesFilled++;
			}
		}
	}
	return tilesFilled;
}

//removes tiles at a depth with region number, fills with WALL
Game.Builder.prototype._removeRegion = function(region, z) {
	for (var x = 0; x < this._width; x++) {
		for (var y = 0; y < this._height; y++) {
			if (this._regions[z][x][y] == region) {
				//clear region and set tile to a wall tile
				this._regions[z][x][y] = 0;
				this._tiles[z][x][y] = Game.Tile.wallTile;
			}
		}
	}
}

//sets up the regions for a given depth
Game.Builder.prototype._setupRegions = function(z) {
	var region = 1;
	var tilesFilled;
	//iterate through all tiles searching for starting tile
	for (var x = 0; x < this._width; x++) {
		for (var y = 0; y < this._height; y++) {
			if (this._canFillRegion(x, y, z)) {
				//try to fill
				tilesFilled = this._fillRegion(region, x, y, z);
				//if too small, remove
				if (tilesFilled <= 20) {
					this._removeRegion(region, z);
				} else {
					region++;
				}
			}
		}
	}
}

//fetch list of points that overlap 
//between regions at a given depth and level beneath
Game.Builder.prototype._findRegionOverlaps = function(z, r1, r2) {
	var matches = [];
	//iterate through all tiles, check if they respect region constraints
	for (var x = 0; x < this._width; x++) {
		for (var y = 0; y < this._height; y++) {
			if (this._tiles[z][x][y] == Game.Tile.floorTile &&
					this._tiles[z+1][x][y] == Game.Tile.floorTile &&
					this._regions[z][x][y] == r1 &&
					this._regions[z+1][x][y] == r2) {
					matches.push({x: x, y: y});
			}
		}
	}
	//shuffle list to prevent bias
	return matches.randomize();
}

//connec two regins by calc'ing overlap & adding stairs
Game.Builder.prototype._connectRegions = function(z, r1, r2) {
	var overlap = this._findRegionOverlaps(z, r1, r2);
	//check for overlap
	if (overlap.length == 0) {
		return false;
	}
	//select first tile from overlap and change it to stairs
	var point = overlap[0];
	this._tiles[z][point.x][point.y] = Game.Tile.stairsDownTile;
	this._tiles[z+1][point.x][point.y] = Game.Tile.stairsUpTile;
	return true;
}


//this tries to connect all regions for each depth level
// starting from the top most level
Game.Builder.prototype._connectAllRegions = function() {
	for (var z = 0; z < this._depth - 1; z++) {
		//iterate through each tile, store properties as strings
		var connected = {};
		var key;
		for (var x = 0; x < this._width; x++) {
			for (var y = 0; y < this._height; y++) {
				key = this._regions[z][x][y] + ',' +
							this._regions[z+1][x][y];
				if (this._tiles[z][x][y] == Game.Tile.floorTile &&
						this._tiles[z+1][x][y] == Game.Tile.floorTile &&
						!connected[key]) {
						//since both tiles are floors try to connect them
						this._connectRegions(z, this._regions[z][x][y],
							this._regions[z+1][x][y]);
						connected[key] = true;
				}
			}
		}
	}
}

