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
	
	
	// User items
	this._userItems = [];

};

GameObj.Rocket.prototype = {

	create: function () {
		
		var self = this;
		
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

		// Create layers
		this._layer1 = this.add.group();
		this._layer1.visible = true;

		// Chest button
		this._btnChest = this.add.button(this.world.width - 60, 60, 'btnChest', this.openChest, this, 2, 0, 1);
		this._btnChest.anchor.set(0.5);
		this._layer1.add(this._btnChest);
		
		// Chest
		this._chest = new Chest(this, this.world.width, -10);
		this.add.existing(this._chest);
		this._layer1.add(this._chest);
		this._chest.inputEnabled = true;
		this._chest.events.onInputDown.add(this.chestClickPress, this);
		this._chest.events.onInputUp.add(this.chestClickRelease, this);
		this._chest.visible = false;
		this._chest.alpha = 0;
		
		
		// Chest
		this._chestLayer = this.add.group();
		this._chestLayer.visible = false;
		this._chestLayer.alpha = 0;
		this._chestLayer.x = 300;

		
		
		
		// Get items from DB
		GameObj.db.getRocketItems(GameObj.user.id, function (res) {
			
			// If no result returned -> no items in rocket yet
			if(res.rows.length == 0) {
				
			}
			else {
				// 
				for(var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					item.update = false;
					self._userItems.push(item);
				}
			}
		
			// Add items
			for(i = 0; i < self._userItems.length; i++)
			{
				// Create item
				self._items[i] = new Item(self, 
					self._userItems[i].x, 
					self._userItems[i].y, 
					'rocket_atlas', 
					itemJson.items[i].name,
					i,
					false
				);
				self._items[i].state = self._userItems[i].state;
				self.add.existing(self._items[i]);
				// Add events
				self._items[i].events.onInputDown.add(self.itemClickPress, self);
				self._items[i].events.onInputUp.add(self.itemClickRelease, self);
			
				// Set in Chest
				if(self._userItems[i].state == 0) {
					self._chestLayer.add(self._items[i]);
					self._chest.setInChest(self._items[i], 200);
				}
			}
		
		});

		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goToMenu, this, 2, 0, 1);
		this._btnBack.anchor.set(0.5);

		// Close Chest button
		this._btnCloseChest = this.add.button(this.world.width, 60, 'btnCloseChest', this.closeChest, this, 2, 0, 1);
		this._btnCloseChest.anchor.set(0.5);
		this._layer1.add(this._btnCloseChest);
		this._btnCloseChest.visible = false;
		this._btnCloseChest.alpha = 0;

		// Chest
		// var graphics = this.add.graphics(0, 0);
// 		graphics.lineStyle(3, 0x000000, 0.8);
// 		graphics.beginFill(0xFFFFFF, 1);
// 		graphics.drawRect(this.world.width - 200, 0, 200, this.world.height);
// 		graphics.endFill();



	},
	
	// TODO: Need to fix
	shutdown: function () {
		
		// User items
		this._userItems = [];
	},
	
	// 
	chestClickPress: function (sprite) {
		
		// saving touch start psoition
		this._startX = this.input.worldX;
		this._startY = this.input.worldY;
		this._chestLayer.saveY = this._chestLayer.y;
     	this._moveIndex = this.input.addMoveCallback(this.dragItems, this);
	},
	
	
	// 
	chestClickRelease: function (sprite) {
		this.input.deleteMoveCallback(this.dragItems, this);
	},
	
	dragItems: function () {
		var currentY = this.input.worldY;
		var deltaY = this._startY - currentY; 

		this._chestLayer.y = this._chestLayer.saveY - deltaY * 2;

		// Check limits
		if(this._chestLayer.y < (-this._chest.getLimit() + this.world.height)){
			this._chestLayer.y = -this._chest.getLimit() + this.world.height;
		}
		if(this._chestLayer.y > 0){
			this._chestLayer.y = 0;
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
			
			
			this._layer1.remove(item);
			this._chestLayer.add(item);
			
			item.state = 0;
			
		}
		else {

			//item.y = this.input.y;
			
			this._chestLayer.remove(item);
			this._layer1.add(item);
			
			item.state = 1;
		}
		
		// Rearange the chest
		this._chest.resetChest();
		// Loop through all the items
		for(var i = 0; i < this._userItems.length; i++) {
			
			var item = this._userItems[i].item;
			// Reposition items in chest
			if(this._items[item].state == 0) {
				
				this._chest.setInChest(this._items[item], -100);
			}
		}
		
	},
	
	openChest: function (pointer) {

		this._chest.bringToTop();
		this._btnCloseChest.bringToTop();

		this._chestLayer.visible = true;
		this._chest.visible = true;
		this._btnCloseChest.visible = true;
		
		// Tween
		this.add.tween(this._btnCloseChest).to( { alpha: 1, x:  this.world.width-60 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		this.add.tween(this._chest).to( { alpha: 1, x:  this.world.width-300 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		this.add.tween(this._chestLayer).to( { alpha: 1, x: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		
	},
	
	closeChest: function (pointer) {
		
		var self = this;
		
		// Tween
		this.add.tween(this._btnCloseChest).to( { alpha: 0, x:  this.world.width }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		this.add.tween(this._chest).to( { alpha: 0, x:  this.world.width }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		var tween = this.add.tween(this._chestLayer).to( { alpha: 0, x: 300 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		
		// One animation end
		tween.onComplete.add(function() {
			self._btnCloseChest.visible = false;
			self._chest.visible = false;
			self._chestLayer.visible = false;
		}, this);
	},
	
	updateItems: function () {

		// TODO: Update only if moved!!!
		// Loop through all the items
		for(var i = 0; i < this._userItems.length; i++) {
			// Update all items
			var item = this._userItems[i].item;
			GameObj.db.updateRocketItem(this._userItems[i].id, this._items[item].x, this._items[item].y, this._items[item].state);
			
		}

	},
	
	goToMenu: function (pointer) {

		// Run item update
		this.updateItems();

		//	Go back to Menu
		this.state.start('Menu');

	}
};