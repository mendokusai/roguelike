//create mixins namespace
Game.Mixins = {};

//define moveable mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);
		//if entry present, player can't move there
		if (target) {
			// if we are attacker, attack target
			if (this.hasMixin('Attacker')) {
				this.attack(target);
				return true;
			} else {
				//if we still can't move to space
				return false;
			}
		} else if (tile.isWalkable()) {
			this._x = x;
			this._y = y;
			return true;
		//check if tile is diggable, dig it.
		} else if (tile.isDiggable()) {
			map.dig(x, y);
			return true;
		}
		return false;
	}
}

Game.Mixins.Destructable = {
	name: 'Destructable',
	init: function() {
		this._hp = 1;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		//if 0 or less, remove
		if (this._hp <= 0) {
			this.getMap().removeEntity(this);
		}
	}
}

Game.Mixins.SimpleAttacker = {
	name: 'SimpleAttacker',
	groupName: 'Attacker',
	attack: function(target) {
		//remove entity if attackable
		if (target.hasMixin('Destructable')) {
			target.takeDamage(this, 1);
		}
	}
}


////////FUNGUS////////////////
Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	act: function() { }
}

Game.FungusTemplate = {
	character: "F",
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructable]
}

// ////////WOLF////////////////
// Game.Mixins.WolfActor = {
// 	name: 'WolfActor',
// 	groupName: 'Actor',
// 	act: function() { }
// }

// Game.WolfTemplate = {
// 	character: "W",
// 	foreground: 'light gray',
// 	mixins: [Game.Mixins.WolfActor]
// }

////////PLAYER////////////////
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		//rerender the screen
		Game.refresh();
		//lock engine and wait for player to press key
		this.getMap().getEngine().lock();
	}
}

Game.PlayerTemplate = {
	character: "$",
	foreground: 'yellow',
	background: 'black',
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor,
						Game.Mixins.SimpleAttacker, Game.Mixins.Destructable]
}




