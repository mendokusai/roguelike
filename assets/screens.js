Game.Screen = {};

Game.Screen.startScreen = {
	enter: function() { console.log("Entered start screen");	},
	exit: function() { console.log("Exited start screen."); },
	render: function(display) {
		display.drawText(1,1, "%c{red}Javascript Roguelike");
		display.drawText(1,2, "Press [Return] to start!");
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			//if enter is pressed go to playScreen
			if (inputData.keyCode === ROT.VK_RETURN) {
				
				Game.switchScreen(Game.Screen.playScreen);
			}
		}
	}
}
Game.Screen.playScreen = {
	_map: null,
	_player: null,

	enter: function() {	

		var width = 100;
		var height = 48;
		var depth = 6;

		//greate map from tiles and player
		var tiles = new Game.Builder(width, height, depth).getTiles();
		//create player and set position
		this._player = new Game.Entity(Game.PlayerTemplate);
		//create map from tiles and player
		this._map = new Game.Map(tiles, this._player);
		//start map engine
		this._map.getEngine().start();

		
	},
	exit: function() { console.log("Exited play screen");	
	},
	render: function(display) {

		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();
		//x-axis doesn't go beyond left bound
		var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		//y-axis doesn't go beyong top boundary
		var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
		
		var visibleCells = {};
		//store this._map and player z to remember it.
		var map = this._map;
		var currentDepth = this._player.getZ();
		//find visible cells and update object
		map.getFov(currentDepth).compute(
			this._player.getX(), this._player.getY(),
			this._player.getSightRadius(),
			function(x, y, radius, visibility) {
				visibleCells[x + "," + y] = true;
				//mark cell as explored
				map.setExplored(x, y, currentDepth, true);
			});

		//render explored map cells
		for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
				if (map.isExplored(x, y, currentDepth)) {
					//fetch glyph for tile and render it
					var tile  = this._map.getTile(x, y, currentDepth);
					//color is dark gray is explored, but not visible
					var foreground = visibleCells[x + ',' + y] ?
						tile.getForeground() : 'darkgray';
						display.draw(
							x - topLeftX,
							y - topLeftY,
							tile.getChar(),
							foreground,
							tile.getBackground()
							);
				}
			}
		}

		//render entities
		var entities = this._map.getEntities();
		for (var key in entities) {
			var entity = entities[key];
			//only render entity if they show in screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
					entity.getX() < topLeftX + screenWidth &&
					entity.getY() < topLeftY + screenHeight &&
					entity.getZ() == this._player.getZ()) {
					if (visibleCells[entity.getX() + ',' + entity.getY()]) {
						display.draw(
						entity.getX() - topLeftX,
						entity.getY() - topLeftY,
						entity.getChar(),
						entity.getForeground(),
						entity.getBackground()
					);
				}
			}
		}

		//get messages in player's queue and render
		var messages = this._player.getMessages();
		var messageY = 0;
		for (var i = 0; i < messages.length; i++) {
			//render message, adding lines
			messageY += display.drawText(
				0,
				messageY,
				'%c{white}%b{black}' + messages[i]
				);
		}

		//render player HP
		var stats = "%c{white}%b{black}";
		stats += vsprintf('HP: %d/%d ', [this._player.getHp(), this._player.getMaxHp()]);
		display.drawText(0, screenHeight, stats);

	},

	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			} else {
				//movement
			if (inputData.keyCode === ROT.VK_LEFT) {
				this.move(-1, 0, 0);
			} else if (inputData.keyCode === ROT.VK_RIGHT) {
				this.move(1, 0, 0);
			} else if (inputData.keyCode === ROT.VK_UP) {
				this.move(0, -1, 0);
			} else if (inputData.keyCode === ROT.VK_DOWN) {
				this.move(0, 1, 0);
			} else {
				//not a valid key
				return;
			}
			//unlock engine on move
			this._map.getEngine().unlock();
			}
		} else if (inputType === 'keypress') {
			var keyChar = String.fromCharCode(inputData.charCode);
			if (keyChar === ">") {
				this.move(0,0,1);
			} else if (keyChar === '<') {
				this.move(0,0,-1);
			} else {
				//not a valid key
				return;
			}
			//unlock engine on move
			this._map.getEngine().unlock();			
		}
	},
	move: function(dX, dY, dZ) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		var newZ = this._player.getZ() + dZ;
		//try to move to new cell

		this._player.tryMove(newX, newY, newZ, this._map);
	}
}

Game.Screen.winScreen = {
	enter: function() {	console.log("Entered win screen.");	},
	exit: function() { console.log("Exited win screen.");	},
	render: function(display) {
		for (var i = 0; i < 22; i++) {
			var r = Math.round(Math.random() * 255);
			var g = Math.round(Math.random() * 255);
			var b = Math.round(Math.random() * 255);
			var background = ROT.Color.toRGB([r, g, b]);
			display.drawText(2, i + 1, "%b{" + background + "}You Win!");
		}
	},
	handleInput: function(inputType, inputData) {
		///nothing to do here
	}
}

//define losing screen
Game.Screen.loseScreen = {
	enter: function() {	console.log("Entered lose screen."); },
	exit: function(){	console.log("Exited lose screen"); },
	render: function(display) {
		for (var i = 0; i < 22; i++) {
			var r = Math.round(Math.random() * 255);
			var g = Math.round(Math.random() * 255);
			var b = Math.round(Math.random() * 255);
			var background = ROT.Color.toRGB([r,g,b]);
			display.drawText(2, i+1, "%b{" + background + "}You Lose!");
		}
	},
	handleInput: function(inputType, inputData) {
		///nothing to do here
	}
}