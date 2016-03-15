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
		var userItems = [];
		GameObj.db.getRocketItems(GameObj.user.id, function (res) {
			
			// If no result returned -> no items in rocket yet
			if(res.rows.length == 0) {
				
			}
			else {
				// Save room in game object
				for(var i = 0; i < res.rows.length; i++) {
					var item = res.rows.item(i);
					item.update = false;
					userItems.push(item);
				}
			}
		
			// Add items
			for(i = 0; i < itemJson.items.length; i++)
			{
				// Create item
				self._items[i] = new Item(self, 
					0,//userItems[i].x, 
					0,//userItems[i].y, 
					'rocket_atlas', 
					itemJson.items[i].name,
					i
				);
				self.add.existing(self._items[i]);
				self._chestLayer.add(self._items[i]);
				// Add events
				self._items[i].events.onInputDown.add(self.itemClickPress, self);
				self._items[i].events.onInputUp.add(self.itemClickRelease, self);
			
				// Increase distance
				
				self._chest.setInChest(self._items[i]);
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
			
			// Put in cloud
			this._chest.putInChest(item);
			
			// item.resetPos();
			
			this._layer1.remove(item);
			this._chestLayer.add(item);
			
			
			
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
			
			this._chestLayer.remove(item);
			this._layer1.add(item);
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
	
	goToMenu: function (pointer) {

		//	Go back to Menu
		this.state.start('Menu');

	}
};