GameObj.Preloader = function (game) {

	this.background = null;
	this.music = null;

	this.ready = false;
	this.audioList = [];

};

GameObj.Preloader.prototype = {

	preload: function () {

		// --- < Set up the preloader > ---
		// These are the assets we loaded in Boot.js
		this.background = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'splashScreen');
		this.background.anchor.setTo(0.5, 0.5);
		//this.background.width = 1280;
		//this.background.height = 800;
		
		var loaderBack = this.add.sprite(640,550,'loaderBack');
		loaderBack.x = this.game.world.centerX - (loaderBack.width/2);
		var loadingBar = this.add.sprite(640,558,'loader');
		loadingBar.x = this.game.world.centerX - (loadingBar.width/2);
		this.load.setPreloadSprite(loadingBar);
		
		GameObj.music = this.add.audio('backgroundMusic');
		GameObj.music.loop = true;
		//GameObj.music.play();
		
		// --- </ Set up the preloader > ---
		
		
		// --- < Configure and Run DB > ---
		// Connect to DB
		GameObj.db = new Db();
		GameObj.db.connect();
		
		// Check if this is first time the app has run
		GameObj.db.getUser(function (res) {
			// If no result returned -> first time
			if(res.rows.length == 0) {
				// Generate random Identity
				var identity = Math.random().toString(36).substr(2, 5);
				// Insert new user
				GameObj.db.insertUser(identity, function (id) {
					// Save user in game object
					GameObj.user = {id: id, identity: identity, level: 0, timestamp: Date.now()};
				});
			}
			else {
				// Save user in game object
				GameObj.user = res.rows[0];
			}
		});
		
		// --- </ Configure and Run DB > ---		
		
		
		// Get JSONs
		var gameJson = this.game.cache.getJSON('game');
		var worldsJson = this.game.cache.getJSON('worlds');
			
		// Load worlds
		var worldObj = null;
		var roomObj = null;
		for(i = 0; i < worldsJson.worlds.length; i++)
		{
			if(worldsJson.worlds[i].enabled == true) 
			{
				worldObj = worldsJson.worlds[i];
				this.load.image('w'+worldObj.id+'_bg', 'assets/img/'+worldObj.background);
				this.load.image('w'+worldObj.id+'_icon', 'assets/img/'+worldObj.icon);
			
				for(j = 0; j < worldObj.rooms.length; j++)
				{
					if(worldObj.rooms[j].enabled == true)
					{
						roomObj = worldObj.rooms[j];
						// Load icon and background
						this.load.spritesheet('w'+worldObj.id+'_r'+roomObj.id+'_icon', 'assets/img/'+roomObj.icon, 180, 192);
						this.load.image('w'+worldObj.id+'_r'+roomObj.id+'_bg', 'assets/img/'+roomObj.background);
						
						// Load item atlas and items
						this.load.atlas('w'+worldObj.id+'_r'+roomObj.id+'_atlas', 'assets/img/'+roomObj.item_image, 'assets/img/'+roomObj.item_atlas, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
						this.load.json('w'+worldObj.id+'_r'+roomObj.id+'_items', 'assets/json/'+roomObj.items);
						
						// Load tasks
						this.load.json('w'+worldObj.id+'_r'+roomObj.id+'_tasks', 'assets/json/'+roomObj.tasks);
					}
				}
			}
		}
		

		// Load other general assets
		this.load.image('cloud', 'assets/img/cloud.png');
		// Buttons
		this.load.spritesheet('btnBack', 'assets/img/button_back.png', 85, 90);
		this.load.spritesheet('btnPlay', 'assets/img/button_play.png', 85, 90);
		
		
		// Alien
		this.load.image('alien-body', 'assets/img/alien/alien-body.png');
		this.load.image('alien-eyes', 'assets/img/alien/alien-eyes.png');
		this.load.image('alien-eye-balls', 'assets/img/alien/alien-eye-balls.png');
		this.load.spritesheet('alien-mouth-talk', 'assets/img/alien/alien-mouth-talk.png', 63, 19, 2);
		
		
		// Load elements for the game
		this.load.image('box', 'assets/img/elements/box.png');
		this.load.image('arrow', 'assets/img/elements/arrow.png');
		
		
		// TODO: Testing audio
		this.load.audio('task1_audio', 'assets/audio/task1.mp3');
		
		// Load assets for Game
		
		
		// Load buttons
		this.load.spritesheet('btnAbout', 'assets/img/button.png', 260, 84);
		this.load.spritesheet('btnMovie', 'assets/img/button_film.png', 260, 84);
		this.load.spritesheet('btnRound', 'assets/img/buttons/round_tmpl.png', 180, 192);
		
		
		this.load.spritesheet('alien', 'assets/img/alien_sprite.png', 250, 467);
		this.load.image('title', 'assets/img/title.png');
		this.load.image('padlock_icon', 'assets/img/padlock.png');
		this.load.image('house_icon', 'assets/img/house.png');
		this.load.image('rocket_icon', 'assets/img/rocket.png');
		this.load.image('rocket_bg', 'assets/img/rocket_bg.png');
		this.load.image('home_bg', 'assets/img/home.png');
		
		this.load.image('alien3', 'assets/img/alien3.png');
		
		
		// Load audio files
		this.load.audio('whatDoINeed_audio', 'assets/audio/what_do_i_need.mp3');
		this.audioList.push('whatDoINeed_audio');
		this.load.audio('correct_audio', 'assets/audio/correct.mp3');
		this.audioList.push('correct_audio');
		this.load.audio('wrong_audio', 'assets/audio/wrong.mp3');
		this.audioList.push('wrong_audio');
		this.load.audio('order_audio', 'assets/audio/order.mp3');
		this.audioList.push('order_audio');
		
		// Load task audio files
		// Wait for task files to be loaded
		// TODO: Some problems with loading
		this.load.onFileComplete.add(function(progress, key) {
			
			var pos = key.indexOf('_tasks');
			if(pos > -1) {
				var prefix = key.substring(0, pos);
				var json = this.cache.getJSON(key);
				// Check if tasks exist
				if(json.tasks != null) {
					for(i = 0; i < json.tasks.length; i++) {
						this.load.audio(prefix+'_t'+json.tasks[i].id+'_audio', 'assets/audio/'+json.tasks[i].audio);
						this.audioList.push(prefix+'_t'+json.tasks[i].id+'_audio');
					}
				}
			}
			
		}, this);

	},

	create: function () {

		var audioFiles = [];
		for(i = 0; i < this.audioList.length; i++) {
			audioFiles[i] = this.add.audio(this.audioList[i]);
		}
		// Wait till audio decoded
		this.sound.setDecodedCallback(audioFiles, this.audioDecoded, this);
		console.log('Decoding MP3...');
		
		// Enable Physics
		this.physics.startSystem(Phaser.Physics.ARCADE);

	},
	
	audioDecoded: function () {
		console.log('MP3 decoded.');
		// TODO: Change this to have longer splash screen
		this.time.events.add(Phaser.Timer.SECOND * 1, this.goToMenu, this);
	},
	
	goToMenu: function () {
		this.state.start('Menu');
	}

};