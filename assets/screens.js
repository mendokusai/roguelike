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
			console.log(ROT.VK_RETURN);
			console.log(inputData);
			// debugger;
			if (inputData.keyCode === ROT.VK_RETURN) {
				console.log("hi");
				Game.switchScreen(Game.Screen.playScreen);
			}
		}
	}
}

Game.Screen.playScreen = {
	_map: null,
	_centerX: 0,
	_centerY: 0,
	
	enter: function() {	
		var map = [];
		// var mapWidth = 500;
		// var mapHeight = 500;
		//extra version
		var mapWidth = 250;
		var mapHeight = 250;

		for (var x = 0; x < mapWidth; x++) {
			//created nested array for y values
			map.push([]);
			//add tiles
			for (var y = 0; y < mapHeight; y ++) {
				map[x].push(Game.Tile.nullTile);
			}
		}
		//extra version
		var generator = new ROT.Map.Uniform(mapWidth, mapHeight, {timeLimit: 5000});
		// var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
		// generator.randomize(0.5);
		// var totalIterations = 3;
		// //Iteratively smothern the map
		// for (var i = 0; i < totalIterations - 1; i++) {
		// 	generator.create();
		// }
		// smoothen it one last time and then update our map
		generator.create(function(x, y, v) {
			if (v === 1) {
				map[x][y] = Game.Tile.floorTile;
			} else {
				map[x][y] = Game.Tile.wallTile;
			}
	});
	this._map = new Game.Map(map);	
	},
	exit: function() { console.log("Exited play screen");	
	},
	render: function(display) {

		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();
		//x-axis doesn't go beyond left bound
		var topLeftX = Math.max(0, this._centerX - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		var topLeftY = Math.max(0, this._centerY - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
		for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
				//fetch flyph for tile and render to screen
				var glyph = this._map.getTile(x, y).getGlyph();
				display.draw(
					x - topLeftX, 
					y - topLeftY, 
					glyph.getChar(),
					glyph.getForeground(),
					glyph.getBackground());
			}
		}
		//render cursor
		display.draw(
			this._centerX - topLeftX,
			this._centerY - topLeftY,
			'$', 'yellow', 'black');
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.winScreen);
			} else if (inputData.keyCode === ROT.VK_ESCAPE) {
				Game.switchScreen(Game.Screen.loseScreen);
			}
			//movement
			if (inputData.keyCode === ROT.VK_LEFT) {
				this.move(-1, 0);
			} else if (inputData.keyCode === ROT.VK_RIGHT) {
				this.move(1, 0);
			} else if (inputData.keyCode === ROT.VK_UP) {
				this.move(0, -1);
			} else if (inputData.keyCode === ROT.VK_DOWN) {
				this.move(0, 1);
			}
		}
	},
	move: function( dX, dY) {
		//Positive dX > RIGHT
		//Negative >> LEFT
		//0 means none
		this._centerX = Math.max(0,
			Math.min(this._map.getWidth() - 1, this._centerX + dX));
		//Positive dY > DOWN
		//Negative dY > UP
		//o means none
		this._centerY = Math.max(0, 
			Math.min(this._map.getHeight() - 1,
				this._centerY + dY));
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