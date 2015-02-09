//create mixins namespace
Game.Mixins = {};

//define moveable mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, z, map) {
		var map = this.getMap();
		//must use starting z
		var tile = map.getTile(x, y, this.getZ());
		var target = map.getEntityAt(x, y, this.getZ());
		//if z level changed, check if we are on stair
		if (z < this.getZ()) {
			if (tile != Game.Tile.stairsUpTile) {
				Game.sendMessage(this, "You can't go up here.");
			} else {
				Game.sendMessage(this, "You ascend to level %d.", [z + 1]);
				this.setPosition(x, y, z);
			}
		} else if (z > this.getZ()) {
			if (tile != Game.Tile.stairsDownTile) {
				Game.sendMessage(this, "You are unable to go down here.");
			} else {
				this.setPosition(x, y, z);
				Game.sendMessage(this, "You descend the dark stairwell to level %d.", [z+1]);
			}
		//if entry present, player can't move there
		} else if (target) {
			// if we are attacker, attack target
			if (this.hasMixin('Attacker')) {
				this.attack(target);
				return true;
			} else {
				//if we still can't move to space
				return false;
			}
		} else if (tile.isWalkable()) {
			this.setPosition(x, y, z);
			return true;
		//check if tile is diggable, dig it.
		} else if (tile.isDiggable()) {
			map.dig(x, y, z);
			return true;
		}
		return false;
	}
}


Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		//rerender the screen
		Game.refresh();
		//lock engine and wait for player to press key
		this.getMap().getEngine().lock();
		//clear messages queue
		this.clearMessages();
	}
}

Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	init: function() {
		this._growthsRemaining = 5;
	},
	act: function() {
		//check to see if spawn child
		if (this._growthsRemaining > 0) {
			if (Math.random() <= 0.02) {
				//generate coordinates of random adjuacent square
				//generate offset [-1,0,1] for x & y
				//generate number 0-2, subtract 1
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				//check to make sure spawn on same tile
				if (xOffset != 0 || yOffset != 0) {
					//check if we can actualy spawn at location
					if (this.getMap().isEmptyFloor(this.getX() + xOffset,
																				 this.getY() + yOffset,
																				 this.getZ())) {
						var entity = new Game.Entity(Game.FungusTemplate);
					entity.setX(this.getX() + xOffset);
					entity.setY(this.getY() + yOffset, this.getZ());
					this.getMap().addEntity(entity);
					this._growthsRemaining--;
					//send message to nearby
					Game.sendMessageNearby(this.getMap(),
						entity.getX(), entity.getY(), entity.getZ(),
						"The fungi are growing!");
					}
				}
			}
		}
	}
}

Game.Mixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	attack: function(target) {
		//remove entity if attackable
		if (target.hasMixin('Destructable')) {
			var attack = this.getAttackValue();
			var defense = target.getDefenseValue();
			var max = Math.max(0, attack - defense);
			var damage = 1 + Math.floor(Math.random() * max);

			Game.sendMessage(this, 'You strike the %s for %d damage.',
				[target.getName(), damage]);
			Game.sendMessage(target, 'The %s strikes you for %d damange.',
				[this.getName(), damage]);
			target.takeDamage(this. damage);
		}
	}
}



Game.Mixins.Destructable = {
	name: 'Destructable',
	init: function(template) {
		this._maxHp = template['maxHp'] || this._maxHp;
		this._hp = template['hp'] || this._hp;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getDefenseValue: function() {
		return this._defenseValue;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		//if 0 or less, remove
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'In a rage, you kill the %s.', 
				[this.getName()]);
			Game.sendMessage(this, 'You\'re finished!');
			this.getMap().removeEntity(this);
		}
	}
}

//messaging
Game.Mixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	receiveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
}

Game.Mixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
}

Game.sendMessage = function(recipient, message, args) {
	//check recipient can receive message
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		//if args, format message, else no probz
		if (args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
	}
}

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
	//if args, format message, else not necessary
	if (args) {
		message = vsprintf(message, args);
	}
	//get nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
	//iterate through entities, sending messages if there
	for (var i = 0; i < entities.length; i++) {
		if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
}


Game.FungusTemplate = {
	character: "F",
	foreground: 'green',
	_maxHP: 5,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructable]
}




Game.PlayerTemplate = {
	character: "$",
	foreground: 'yellow',
	background: 'black',
	hp: 40,
	maxHp: 40,
	attackValue: 10,
	sightRadius: 5,
	mixins: [Game.Mixins.PlayerActor,
						Game.Mixins.Attacker, Game.Mixins.Destructable,
						Game.Mixins.Sight, Game.Mixins.MessageRecipient]
}

Game.Mixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function() {
		// flip coint o determine if moving by 1
		var moveOffset = (Math.round(Math.random()) === 1) ? 1: -1;
		// 50/50 towards x or y
		if (Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
		}
	}
};

Game.BatTemplate = {
	name: 'bat',
	character: 'B',
	foreground: 'brown',
	maxHp: 5,
	attackValue: 4,
	mixins: [
			Game.Mixins.WanderActor,
			Game.Mixins.Attacker, 
			Game.Mixins.Destructable
			]
};

Game.NewtTemplate = {
	name: 'newt',
	character: '%',
	foreground: 'blue',
	maxHp: 3,
	attackValue: 2,
	mixins: [
			Game.Mixins.WanderActor,
			Game.Mixins.Attacker,
			Game.Mixins.Destructable
			]
};




