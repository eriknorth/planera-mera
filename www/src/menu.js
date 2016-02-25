GameObj.Menu = function (game) {

	this.music = null;
	this.btnAbout = null;
	this.btnMovie = null;

};

GameObj.Menu.prototype = {

	create: function () {
		
		// Set backgound
		this.stage.backgroundColor = '#304656';
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');

		// Add title
		var title = this.add.sprite(this.world.centerX, 80, 'title');
		title.anchor.setTo(0.5, 0.5);
		
		// Defines position of icons depending on the number of worlds
		var dist = this.world.width/4;
		var worldIconPos = [
			[{x:dist*2.5,y:this.world.centerY}],
			[{x:dist*2,y:this.world.centerY},{x:dist*3,y:this.world.centerY}],
			[{x:dist*2.5,y:this.world.centerY-100},{x:dist*2,y:this.world.centerY+100},{x:dist*3,y:this.world.centerY+100}],
			[{x:dist*2,y:this.world.centerY-100},{x:dist*3,y:this.world.centerY-100},{x:dist*2,y:this.world.centerY+100},{x:dist*3,y:this.world.centerY+100}]	
		]
		
		// --- Add elements ---
		// Add rocket	
		var rocket = this.add.sprite(dist, this.world.centerY, 'rocket_icon');
		rocket.anchor.setTo(0.5, 0.5);
		rocket.inputEnabled = true;
		rocket.events.onInputUp.add(this.goToRocket, this);
		
		// Add world icons/padlocks
		var worldCount = worldsJson.worlds.length;
		var worldIcons = [];
		for(i = 0; i < worldCount; i++)
		{
			// TODO: For testing, unlock home
			if(i == 0) {
				worldIcons[i] = this.add.sprite(worldIconPos[worldCount-1][i].x, worldIconPos[worldCount-1][i].y, 'w'+worldsJson.worlds[i].id+'_icon');
				worldIcons[i].inputEnabled = true;
			}
			else {
				worldIcons[i] = this.add.sprite(worldIconPos[worldCount-1][i].x, worldIconPos[worldCount-1][i].y, 'padlock_icon');
				worldIcons[i].inputEnabled = false;
			}
			worldIcons[i].anchor.setTo(0.5, 0.5);
			// Add event
			worldIcons[i].events.onInputUp.add(this.goToWorld(i), this);
		}

		// Add buttons
		this.btnAbout = this.game.add.button(this.game.world.centerX - 280, this.game.world.height - 120, 'btnAbout', this.goToAbout, this, 2, 0, 1);
		this.btnMovie = this.game.add.button(this.game.world.centerX + 20, this.game.world.height - 120, 'btnMovie', this.goToMovie, this, 2, 0, 1);


	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	goToAbout: function (pointer) {

		//	Go to About page
		this.state.start('About');

	},
	
	goToRocket: function (pointer) {

		//	Go to About page
		this.state.start('Rocket');

	},
	
	goToMovie: function (pointer) {

		GameObj.music.stop();

	},
	
	goToWorld: function (world) {
		return function () {
			GameObj.world = world;
			this.state.start('World');
		}
	}

};