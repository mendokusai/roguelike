

Game.Entity = function(properties) {
	properties = properties || {};
	//call glyph's constructor with properties
	Game.Glyph.call(this, properties);
	//instantiate properties
	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._z = properties['z'] || 0;
	this._map = null;

	//create an obj to keep track of mixins attached to entity based on name
	this._attachedMixins = {};
	
	//create similar object for groups
	this._attachedMixinGroups = {};
	
	//setup obj mixins
	var mixins = properties['mixins'] || [];
	for (var i = 0; i < mixins.length; i++) {
		//copy properties from each mixin as long as it's not the naem of the init property
		//don't override property that exists
		for (var key in mixins[i]) {
			if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}
		//add the name of this mixin to attached mixins
		this._attachedMixins[mixins[i].name] = true;
		if (mixins[i].groupName) {
			this._attachedMixinGroups[mixins[i].groupName] = true;
		}
		//call init function if it exists
		if (mixins[i].init) {
			mixins[i].init.call(this, properties);
		}
	}

};

Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.hasMixin = function(obj) {
	//allow passing mixin or name as string
	if (typeof obj === 'object') {
		return this._attachedMixins[obj.name];
	} else {
		return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
	}
} 

Game.Entity.prototype.setName = function(name) {
	this._name = name;
}

Game.Entity.prototype.setX = function(x) {
	this._x = x;
}

Game.Entity.prototype.setY = function(y) {
	this._y = y;
}

Game.Entity.prototype.setMap = function(map) {
	this._map = map;
}

Game.Entity.prototype.setZ = function(z) {
	this._z = z;
}

Game.Entity.prototype.setPosition = function(x, y, z) {
	var oldX = this._x;
	var oldY = this._y;
	var oldZ = this._z;
	//update position
	this._x = x;
	this._y = y;
	this._z = z;
	//if entity is on map, notify map of move
	if (this._map) {
		this._map.updateEntityPosition(this, oldX, oldY, oldZ);
	}
};

Game.Entity.prototype.tryMove = function(x, y, z, map) {
	var map = this.getMap();
	//ust use starting z
	var tile = map.getTile(x, y, this.getZ());
	var target = map.getEntityAt(x, y, this.getZ());
	//if our z level has changed, check if we are on stair
	if (z < this.getZ()) {
		if (tile != Game.Tile.stairsUpTile) {
			Game.sendMessage(this, "You can't go up here.");
		} else {
			Game.sendMessage(this, 'You ascend the stairs to level %d.', [z + 1]);
			this.setPosition(x, y, z);
		}
	} else if (z > this.getZ()) {
		if (tile != Game.Tile. stairsDownTile) {
			Game.sendMessage(this, 'You can\'t go down here.');
		} else {
			this.setPosition(x, y, z);
			Game.sendMessage(this, "You descend the stairs into the darkness that awaits on level %d", [z + 1]);
		}
	// if an entity present at tile
	} else if (target) {
		//if we are an attacker, attack target
		if (this.hasMixin('Attacker') && (this.hasMixin(Game.Mixins.PlayerActor) ||
				target.hasMixin(Game.Mixins.PlayerActor))) {
				this.attack(target);
				return true;
		} 
		return false;
	//check if we can walk on tile, step to it, playa'
	} else if (tile.isWalkable()) {
		this.setPosition(x, y, z);
		return true;
	} else if (tile.isDiggable()) {
		//only dig if entity is player
		if (this.hasMixin(Game.Mixins.PlayerActor)) {
			map.dig(x, y, z);
			return true;
		}
	return false;
	}
	return false;
};

Game.Entity.prototype.getName = function() {
	return this._name;
}

Game.Entity.prototype.getX = function() {
	return this._x;
}

Game.Entity.prototype.getY = function() {
	return this._y;
}

Game.Entity.prototype.getMap = function() {
	return this._map;
}

Game.Entity.prototype.getZ = function() {
	return this._z;
}
// Game.Entity.prototype.setChar = function(char) {
// 	this._char = char;
// }
// Game.Entity.prototype.getChar = function() {
// 	return this._char;
// }

// var HitCounter = {
// 	name: 'HitCounter',
// 	init: function(properties) {
// 		//add state to the entity and read from properties
// 		this._multiplier = properties['multiplier'] || 1;
// 		this._hits = 0;
// 	},
// 	incrementHit: function() {
// 		//update state
// 		this._hits += this._multiplier;
// 	},
// 	getTotalHits: function() {
// 		return this._hits;
// 	}
// }

// var e = new Game.Entity({
// 	character: "$",
// 	foreground: 'blue',
// 	x: 1,
// 	y: 3,
// 	name: "Test Entity",
// 	mixins: [HitCounter],
// 	multiplier: 5
// })
// console.log(e.getTotalHits());
// e.incrementHit();
// e.incrementHit();
// console.log(e.getTotalHits());

// var PlayerMoveableMixin = {
// 	name: 'PlayerMoveable',
// 	groupName: 'Moveable',
// 	tryMove: function(x, y){...}
// }
// var MoleratMoveableMixin = {
// 	name: 'MoleratMoveable',
// 	groupName: 'Moveable',
// 	tryMove: function(x, y){...}
// }
// var GhostMoveableMixin = {
// 	name: 'GhostMoveable', 
// 	groupName: 'Moveable',
// 	tryMove: function(x, y){...}
// }
// //testing specifically
// entity.hasMixin('GhostMoveable')
// entity.hasMixin(GhostMoveableMixin)

// //testing generally
// entity.hasMixin('Moveable')
