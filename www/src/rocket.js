GameObj.Rocket = function (game) {

	this._btnBack = null;
	this._btnChest = null;
	
	// Items
	this._itemArray = null;
	this._items = [];

};

GameObj.Rocket.prototype = {

	create: function () {
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		// Rocket Object
		var rocketObj = worldsJson.rocket;
		
		// Get items
		var itemJson = this.cache.getJSON('rocket_items');
		this._itemArray = itemJson.items;
		
		// Background
		this.add.sprite(0, 0, 'rocket_bg');
		this.game.stage.backgroundColor = '#304656';




		// Add items
		for(i = 0; i < itemJson.items.length; i++)
		{
			// Create item
			this._items[i] = new Item(this, 
				this.rnd.integerInRange(0, 1280), 
				this.rnd.integerInRange(0, 800), 
				'rocket_atlas', 
				itemJson.items[i].name,
				i
			);
			this.add.existing(this._items[i]);
			//this._layer1.add(this._items[i]);
			// Add events
			this._items[i].events.onInputDown.add(this.itemClickPress, this);
			//this._items[i].events.onInputUp.add(this.itemClickRelease, this);
		}


		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this._btnBack.anchor.set(0.5);
		
		// Play button
		this._btnChest = this.add.button(this.world.width - 60, 60, 'btnChest', this.openChest, this, 2, 0, 1);
		this._btnChest.anchor.set(0.5);




		// Chest
		var graphics = this.add.graphics(0, 0);
		graphics.lineStyle(3, 0x000000, 0.8);
		graphics.beginFill(0xFFFFFF, 1);
		graphics.drawRect(this.world.width - 200, 0, 200, this.world.height);
		graphics.endFill();
		
		



	},
	
	// Pick up item
	itemClickPress: function (sprite) {
		// Bring item to front
		sprite.bringToTop();
	},
	
	openChest: function (pointer) {
		
	},
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	}
};