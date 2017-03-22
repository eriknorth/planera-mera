// Variables that presist through out the states
GameObj = {

	// TODO: Review these!
	score: 0,
	music: null,
	backWidth: 1280,
	backHeight: 800,
	db: null,
	world: null,
	room: null,

	// New variables
	user: null,
	level: null,
	task: null,

	cogTaskList: [426,428,313,10,12,224,1,232,236,326,331,437,421,406,329,328,323,3,31,17,9999],
	cogTaskIndex: 0
};

GameObj.Boot = function (game) {

	this.ready = false;
};

GameObj.Boot.prototype = {

	init: function () {

		// Set scaling
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		//this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;


		//this.time.advancedTiming = true;
		// Calculate background scaling
		// var ratio = 1280 / 800;
// 		var gameRatio = this.game.width / this.game.height;
// 		if(gameRatio <= ratio)
// 		{
// 			GameObj.backWidth = this.game.height*ratio;
// 			GameObj.backHeight = this.game.height;
// 			// console.log("first");
// 			// console.log(GameObj.backWidth);
// 			// console.log(GameObj.backHeight);
// 		}
// 		else
// 		{
// 			GameObj.backWidth = this.game.width;
// 			GameObj.backHeight = this.game.width*ratio;
// 			// console.log("second");
// 			// console.log(GameObj.backWidth);
// 			// console.log(GameObj.backHeight);
// 		}


	},

	preload: function () {

		//  Here we load the assets required for our preloader
		this.load.image('splashScreen', 'assets/img/splash.png');
		this.load.image('loaderBack', 'assets/img/loader-back.png');
		this.load.image('loader', 'assets/img/loader.png');

		//this.load.audio('backgroundMusic', 'assets/audio/music_background.mp3');

		// Load JSON files
		this.load.json('game', 'assets/json/game.json');
		this.load.json('worlds', 'assets/json/worlds.json');

	},

	create: function () {

	},

	update: function () {

		// Check if audio has been decoded
		//if (this.cache.isSoundDecoded('backgroundMusic') && this.ready == false)
		//{
			this.ready = true;
			// Start preloader
			this.state.start('Preloader');
		//}

	}
};
