GameObj.Room = function (game) {
		
	this.prefix = null;
	

	this.itemArray = [];
	this.taskArray = [];
	
	
	// --- Revised vairables ---
	// Gameplay state
	this._state = 0;
	
	// Current task
	this._currTask = null;
	
	// Alien
	this._alien = null;
	
	// Cloud
	this._cloud = null;
	
	// Box
	this._box = null;
	
	// Array for selected item list
	this._selectedItems = [];
	
	// Layers
	this._layer1 = null;
	this._layer2 = null;
	
	// Overlay
	this._overlay = null;
	
	// Array for Items
	this._items = [];
	
	// Buttons
	this._btnBack = null;
	this._btnPlay = null;
};

GameObj.Room.prototype = {

	create: function () {
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		// Get main objects
		var worldObj = worldsJson.worlds[GameObj.world];
		var roomObj = worldObj.rooms[GameObj.room];
		
		// Make prefix
		this.prefix = 'w'+worldObj.id+'_r'+roomObj.id;
		
		// Get itmes
		var itemJson = this.cache.getJSON(this.prefix + '_items');
		this.itemArray = itemJson.items;
		// Get tasks
		var taskJson = this.cache.getJSON(this.prefix + '_tasks');
		this.taskArray = taskJson.tasks;
		
		// Create layers
		this._layer1 = this.add.group();
		this._layer2 = this.add.group();
		this._layer1.visible = true;
		this._layer2.visible = false;
		
		// Background
		var background = this.add.sprite(0, 0, this.prefix + '_bg');
		this._layer1.add(background);
		
		// Alien
		this._alien = new Alien(this, 1150, 550);
		this.add.existing(this._alien);
		this._alien.inputEnabled = true;
		this._alien.events.onInputDown.add(this.alienClickRelease, this);
		this._layer1.add(this._alien);
	
		// Cloud
		this._cloud = new Cloud(this, 0, 600);
		this.add.existing(this._cloud);
		this._layer1.add(this._cloud);
		
		
		// Add items
		for(i = 0; i < itemJson.items.length; i++)
		{
			// Create item
			this._items[i] = new Item(this, 
				itemJson.items[i].x, 
				800-itemJson.items[i].y, 
				this.prefix + '_atlas', 
				itemJson.items[i].name,
				i
			);
			this.add.existing(this._items[i]);
			this._layer1.add(this._items[i]);
			// Add events
			this._items[i].events.onInputDown.add(this.itemClickPress, this);
			this._items[i].events.onInputUp.add(this.itemClickRelease, this);
		}
		
		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goToWorld, this, 2, 0, 1);
		this._btnBack.anchor.set(0.5);
		
		// Play button
		this._btnPlay = this.add.button(this.world.width - 60, 60, 'btnPlay', this.play, this, 2, 0, 1);
		this._btnPlay.anchor.set(0.5);
			
		
		// Overlay
		var overlayBitmap = this.add.bitmapData(this.world.width, this.world.height);
		var overlayGradient = overlayBitmap.context.createLinearGradient(0,0,0,this.world.height);
		overlayGradient.addColorStop(0,'rgba(36,65,92,0.95)');
		overlayGradient.addColorStop(1,'rgba(16,29,41,1.0)');
		overlayBitmap.context.fillStyle = overlayGradient;
		overlayBitmap.context.fillRect(0,0,this.world.width,this.world.height);
		// Add overlay
		this._overlay = this.add.sprite(0, 0, overlayBitmap);
		this._overlay.inputEnabled = true;
		this._overlay.alpha = 0;
		this._layer2.add(this._overlay);
		
		// Add slots/_boxes for items
		this._box = new Box(this, 280);
		this.add.existing(this._box);
		this._layer2.add(this._box);
		
		// TODO: For testing choose random task
		var rndNum = this.rnd.integerInRange(0, taskJson.tasks.length-1);
		this._currTask = this.taskArray[rndNum];

		// Update _boxes
		this._box.setBoxes(this._currTask.items.length);
		
		// Sound library
		this._sound = new Sound(this);
	},
	
	// TODO: Need to fix
	shutdown: function () {
		
		
		// TODO: Destroy this...
		this.itemGroups = [];
		this.items = [];
		this.shadows = [];
		
		if (this._alien) {
			this._alien.destroy();
			this._alien = null;
		}
	
		this.prefix = null;
		this._selectedItems = [];
		this.itemArray = [];
		this.taskArray = [];
		this.task = null;
		
		// --- Revised vairables ---
		// Gameplay state
		this._state = 0;
	
		// Current task
		this._currTask = null;
	
		// Alien
		this._alien = null;
	
		// Cloud
		this._cloud = null;
	
		// Box
		this._box = null;
	
		// Array for selected item list
		this._selectedItems = [];
	
		// Layers
		this._layer1 = null;
		this._layer2 = null;
	
		// Overlay
		this._overlay = null;
	
		// Array for Items
		this._items = [];
	
		// Buttons
		if (this._btnBack) {
			this._btnBack.destroy();
			this._btnBack = null;
		}
		if (this._btnPlay) {
			this._btnPlay.destroy();
			this._btnPlay = null;
		}
	},
	
	// TODO: Need to fix
	startTask: function (task) {
		
	},
	
	goToWorld: function (pointer) {
		//	Go back to world
		this.state.start('World');
	},
	
	// Check result
	play: function (pointer) {
		
		var self = this;
		
		
		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:
			// Play result
			if(this.checkFirstAnswer() == true) {
				// Correct
				this._alien.talk(true);
				this._sound.playSequence(['correct_audio', 500, 'order_audio'], 
					function() { self._alien.talk(false); },
					function() { self._alien.talk(false); },
					function() { self._alien.talk(true); }
				);
			
				// TODO: Testing layers
				this._layer1.remove(this._alien);
				this._layer1.remove(this._cloud);
				this._layer2.add(this._alien);
				this._layer2.add(this._cloud);
				// Bring _box on top
				this._layer2.bringToTop(this._box);
			
				// Move items
				for(i = 0; i < this._selectedItems.length; i++)
				{
					this._layer1.remove(this._items[this._selectedItems[i]]);
					this._layer2.add(this._items[this._selectedItems[i]]);
				}
			
				this._layer2.visible = true;
			
				this.add.tween(this._overlay).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
			
				this._state = 1;
			}
			else {
				// Wrong
				this._alien.talk(true);
				this._sound.play('wrong_audio', function() { 
					self._alien.talk(false); 
				});
			}
			break;
		case 1:
			
			// Play result
			if(this.checkSecondAnswer() == true) {
				// Correct
				this._alien.talk(true);
				this._sound.play('correct_audio', function() { 
					self._alien.talk(false); 
				});
				
				
				// TODO: Testing layers
				this._layer2.remove(this._alien);
				this._layer2.remove(this._cloud);
				this._layer1.add(this._alien);
				this._layer1.add(this._cloud);			
			
				var tween = this.add.tween(this._layer2).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
				tween.onComplete.add(function() {
					
					self._overlay.alpha = 0;
					self._layer2.visible = false;
					self._layer2.alpha = 1;
					self._state = 0;
					
					// Move items
					for(i = 0; i < this._selectedItems.length; i++)
					{
						this._layer2.remove(this._items[this._selectedItems[i]]);
						this._layer1.add(this._items[this._selectedItems[i]]);
					
						this._items[this._selectedItems[i]].resetPos();
						this._items[this._selectedItems[i]].alpha = 0;
						this.add.tween(this._items[this._selectedItems[i]]).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
					}
					
				}, this);
				
			}
			else {
				// Wrong
				this._alien.talk(true);
				this._sound.play('wrong_audio', function() { 
					self._alien.talk(false); 
				});
			}
			break;
			
			break;
		default:
			break;
		}
	},
	
	// Pick up item
	itemClickPress: function (sprite) {
		// Bring item to front
		sprite.bringToTop();
	},
	
	// Put down item
	itemClickRelease: function (item) {

		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:

			// Check if item in the list
			var index = this._selectedItems.indexOf(item.getId());
			
			if(this._cloud.checkOverlap(item) == true) {
				// Add item (if does not exist in the list)
				if(index == -1) {
					this._selectedItems.push(item.getId());
				}
			}
			else {
				// Remove item (if exists in the list)
				if(index > -1) {
					this._selectedItems.splice(index, 1);
				}
				// Move to initial position
				item.resetPos();
			}
			
			break;
		case 1:
			
			// Check if set on a cloud
			this._cloud.checkOverlap(item);
			
			// Check if set on a box
			if(this._box.checkOverlap(item) == false) {
				// No -> Move to cloud
				this._cloud.putInCloud(item);
			}
			
			
			break;
		default:
			break;
		}
		
	},
	
	// Click on _alien (release)
	alienClickRelease: function (sprite) {

		var self = this;

		// Start talking animation
		this._alien.talk(true);
		
		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:
			this._sound.playSequence([this.prefix + '_t' + this._currTask.id + '_audio', 200, 'whatDoINeed_audio'], 
				function() { self._alien.talk(false); },
				function() { self._alien.talk(false); },
				function() { self._alien.talk(true); }
			);
			break;
		case 1:
			this._sound.playSequence([this.prefix + '_t' + this._currTask.id + '_audio', 200, 'order_audio'], 
				function() { self._alien.talk(false); },
				function() { self._alien.talk(false); },
				function() { self._alien.talk(true); }
			);
			break;
		default:
			break;
		}
	},
	
	
	// Check first part answer
	checkFirstAnswer: function () {
		
		var result = 0;
		var correctItem = false;
		var taskItem = null;
		
		for(i = 0; i < this._selectedItems.length; i++)
		{
			for(j = 0; j < this._currTask.items.length; j++)
			{
				taskItem = this._currTask.items[j];
				
				// Check item
				if(taskItem.item != '') {
					if(this.itemArray[this._selectedItems[i]].name == taskItem.item) {
						correctItem = true;
					}
				}
				// Check category
				else if(taskItem.category != '') {
					for(k = 0; k < this.itemArray[this._selectedItems[i]].categories.length; k++) {
						if(this.itemArray[this._selectedItems[i]].categories[k] == taskItem.category) {
							correctItem = true;
						}
					}
				}
			}
			
			if(correctItem == false) {
				result = -1;
				break;
			}
			else {
				result++;
				correctItem = false;
			}
		}
		
		
		// Play result
		if(result >= this._currTask.items.length) {
			return true;
		}
		else {
			return false;
		}
		
	},
	
	// Check second part answer
	checkSecondAnswer: function () {
		
		var itemOrder = this._box.getOrder();
		
		// Sort by order
		this._currTask.items.sort(function(a, b){
			return a.order - b.order;
		})
		
		// Set initial order position
		var currPos = this._currTask.items[0].order;
		var result = 0;
		var correctItem = false;
		var correctOrder = false;
		
		for(i = 0; i < this._currTask.items.length; i++)
		{
			currPos = this._currTask.items[i].order;
			
			for(j = 0; j < this._currTask.items.length; j++)
			{
				taskItem = this._currTask.items[j];
				
				// Check item
				if(taskItem.item != '') {
					if(this.itemArray[itemOrder[i]].name == taskItem.item) {
						correctItem = true;
					}
				}
				// Check category
				else if(taskItem.category != '') {
					for(k = 0; k < this.itemArray[itemOrder[i]].categories.length; k++) {
						if(this.itemArray[itemOrder[i]].categories[k] == taskItem.category) {
							correctItem = true;
						}
					}
				}
				
				
				if(correctItem == true) {
					if(currPos == taskItem.order) {
						correctOrder = true;
					}
					else {
						// Not right
					}
					break;
				}
			}
			
			if(correctOrder == false) {
				result = -1;
				break;
			}
			else {
				result++;
				correctItem = false;
				correctOrder = false;
			}
		}
		
		
		// Play result
		if(result >= this._currTask.items.length) {
			return true;
		}
		else {
			return false;
		}
	}

};