GameObj.Rocket = function (game) {

	this._btnBack = null;
	this._btnChest = null;
	
	// Items
	this._itemArray = null;
	this._items = [];
	
	// Chest
	this._chest = null;
	
	this._startX = null;
	this._startY = null;
	this._moveIndex = null;

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

		// Chest
		this._chest = new Chest(this, this.world.width-300, -10);
		this.add.existing(this._chest);
		this._chest.inputEnabled = true;
		this._chest.events.onInputDown.add(this.chestClickPress, this);
		this._chest.events.onInputUp.add(this.chestClickRelease, this);

		
		// Create layers
		this._layer1 = this.add.group();
		this._layer2 = this.add.group();
		this._layer1.visible = true;
		this._layer2.visible = true;
		
		// Add items
		var space = 100;
		for(i = 0; i < itemJson.items.length; i++)
		{
			// Create item
			this._items[i] = new Item(this, 
				0, 
				0, 
				'rocket_atlas', 
				itemJson.items[i].name,
				i
			);
			this.add.existing(this._items[i]);
			this._layer2.add(this._items[i]);
			// Add events
			this._items[i].events.onInputDown.add(this.itemClickPress, this);
			this._items[i].events.onInputUp.add(this.itemClickRelease, this);
			
			// Increase distance
			this._chest.setInChest(this._items[i]);
		}

		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this._btnBack.anchor.set(0.5);
		
		// Play button
		this._btnChest = this.add.button(this.world.width - 60, 60, 'btnChest', this.openChest, this, 2, 0, 1);
		this._btnChest.anchor.set(0.5);




		// Chest
		// var graphics = this.add.graphics(0, 0);
// 		graphics.lineStyle(3, 0x000000, 0.8);
// 		graphics.beginFill(0xFFFFFF, 1);
// 		graphics.drawRect(this.world.width - 200, 0, 200, this.world.height);
// 		graphics.endFill();



	},
	
	// 
	chestClickPress: function (sprite) {
		
		// saving touch start psoition
		this._startX = this.input.worldX;
		this._startY = this.input.worldY;
		this._layer2.saveY = this._layer2.y;
     	this._moveIndex = this.input.addMoveCallback(this.dragItems, this);
	},
	
	
	// 
	chestClickRelease: function (sprite) {
		this.input.deleteMoveCallback(this.dragItems, this);
	},
	
	dragItems: function () {
		var currentY = this.input.worldY;
		var deltaY = this._startY - currentY; 

		this._layer2.y = this._layer2.saveY - deltaY * 2;

		// Check limits
		if(this._layer2.y < (-this._chest.getLimit() + this.world.height)){
			this._layer2.y = -this._chest.getLimit() + this.world.height;
		}
		if(this._layer2.y > 0){
			this._layer2.y = 0;
		}
	},
	
	
	// Pick up item
	itemClickPress: function (sprite) {
		// Bring item to front
		sprite.bringToTop();
	},
	
	// Put down item
	itemClickRelease: function (item) {


		// Check if item in the list
		//var index = this._selectedItems.indexOf(item.getId());
		if(this._chest.checkOverlap(item) == true) {
			
			// Put in cloud
			this._chest.putInChest(item);
			
			// item.resetPos();
			
			this._layer1.remove(item);
			this._layer2.add(item);
			
			
			
			// Add item (if does not exist in the list)
			// if(index == -1) {
// 				this._selectedItems.push(item.getId());
// 			}
		}
		else {
			// Remove item (if exists in the list)
			// if(index > -1) {
// 				this._selectedItems.splice(index, 1);
// 			}
			// Move to initial position
			//item.resetPos();
			item.y = this.input.y;
			
			this._layer2.remove(item);
			this._layer1.add(item);
		}
		
	},
	
	openChest: function (pointer) {
		
	},
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	}
};