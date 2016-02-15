GameObj.Room = function (game) {

	this.btnBack = null;
	
	this.itemGroups = [];
	this.items = [];
	this.shadows = [];
	
	this.audio = null;
	this.correctAudio = null;
	this.wrongAudio = null;
	this.taskAudio = null;
	this.alien = null;
	
	this.prefix = null;
	
	this.selectedItems = [];
	this.itemArray = [];
	this.taskArray = [];
	
	this.task = null;
	
	
	this.layer1 = null;
	this.layer2 = null;
};

GameObj.Room.prototype = {

	create: function () {
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		// Get main objects
		var worldObj = worldsJson.worlds[GameObj.world];
		var roomObj = worldObj.rooms[GameObj.room];
		
		// Get itmes
		var itemJson = this.cache.getJSON('w'+worldObj.id+'_r'+roomObj.id+'_items');
		this.itemArray = itemJson.items;
		// Get tasks
		var taskJson = this.cache.getJSON('w'+worldObj.id+'_r'+roomObj.id+'_tasks');
		this.taskArray = taskJson.tasks;
		
		this.prefix = 'w'+worldObj.id+'_r'+roomObj.id;
		
		// Create layers
		this.layer1 = this.add.group();
		this.layer2 = this.add.group();
		this.layer1.visible = true;
		this.layer2.visible = false;
		
		
		// Background
		var background = this.add.sprite(0, 0, 'w'+worldObj.id+'_r'+roomObj.id+'_bg');
		this.layer1.add(background);
		
		
		// Alien
		this.alien = new Alien(this, 1150, 550);
		this.add.existing(this.alien);
		this.alien.inputEnabled = true;
		this.alien.events.onInputDown.add(this.alienUp, this);
		this.layer1.add(this.alien);
	
		
		// Cloud
		this.cloud = this.add.sprite(0, 600, 'cloud');
		this.layer1.add(this.cloud);
		
		
		// Create array for Items
		this.itemObj = [];
		
		// Add items
		for(i = 0; i < itemJson.items.length; i++)
		{
			this.itemGroups[i] = this.add.group();
			
			// Add shadow (so it is under the item)
			this.shadows[i] = this.add.sprite(this.world.centerX, this.world.centerY, 'w'+worldObj.id+'_r'+roomObj.id+'_atlas', itemJson.items[i].name);
			this.shadows[i].anchor.set(0.5);
			this.shadows[i].tint = 0x000000;
			this.shadows[i].alpha = 0.4;
			this.shadows[i].scale.setTo(1.15);
			this.shadows[i].visible = false;
			// Add to group
			this.itemGroups[i].add(this.shadows[i]);
			
			// Add item
			this.items[i] = this.add.sprite(itemJson.items[i].x, 800-itemJson.items[i].y, 'w'+worldObj.id+'_r'+roomObj.id+'_atlas', itemJson.items[i].name);
			this.items[i].anchor.setTo(0.5, 0.5);
			this.items[i].inputEnabled = true;
			this.items[i].input.enableDrag();
			this.items[i].listId = i;
			this.items[i].initX = itemJson.items[i].x;
			this.items[i].initY = 800-itemJson.items[i].y;
			// Add to group
			this.itemGroups[i].add(this.items[i]);
			// Add events
			//this.items[i].events.onInputDown.add(this.itemDown, this);
			this.items[i].events.onInputUp.add(this.itemUp, this);
			this.items[i].events.onDragUpdate.add(this.itemDrag, this);

			
			// TODO: Testing, added group to layer2 instead of layer1
			this.layer2.add(this.itemGroups[i]);
			
			
			// Item objects
			this.itemObj[i] = new Item(this, itemJson.items[i].x, 800-itemJson.items[i].y, 'w'+worldObj.id+'_r'+roomObj.id+'_atlas', itemJson.items[i].name);
			this.add.existing(this.itemObj[i]);
			this.layer1.add(this.itemObj[i]);
			this.itemObj[i].events.onInputDown.add(this.itemDown, this);
		}
		
		// Back button
		this.btnBack = this.add.button(60, 60, 'btnBack', this.goToWorld, this, 2, 0, 1);
		this.btnBack.anchor.set(0.5);
		
		// Play button
		this.btnPlay = this.add.button(this.world.width - 60, 60, 'btnPlay', this.play, this, 2, 0, 1);
		this.btnPlay.anchor.set(0.5);
		
		
		
		// Add audio
		this.audio = this.add.audio('whatDoINeed_audio');
		this.audio.onStop.add(this.soundStopped, this);
		//
		this.correctAudio = this.add.audio('correct_audio');
		this.correctAudio.onStop.add(this.soundStopped, this);
		this.wrongAudio = this.add.audio('wrong_audio');
		this.wrongAudio.onStop.add(this.soundStopped, this);
		
		
		// Overlay
		var graphicOverlay = new Phaser.Graphics(this, 0, 0);
		graphicOverlay.beginFill(0x000000, 0.85);
		graphicOverlay.drawRect(0,0, this.world.width, this.world.height);
		graphicOverlay.endFill();
		
		this.overlay = this.add.sprite(0,0,graphicOverlay.generateTexture());
		this.overlay.inputEnabled = true;
		this.overlay.alpha = 0;
		this.layer2.add(this.overlay);
		
		// Destroy graphics
		graphicOverlay.destroy();
		
		
		// Add slots for items
		
		
		
		
		
		
		
		
		
		
		
		// TODO: For testing choose random task
		var num = this.rnd.integerInRange(0, taskJson.tasks.length-1);
		this.startTask(taskJson.tasks[num]);
		this.task = num;
	},
	
	shutdown: function () {
		
		if (this.btnBack) {
			this.btnBack.destroy();
			this.btnBack = null;
		}
		
		// TODO: Destroy this...
		this.itemGroups = [];
		this.items = [];
		this.shadows = [];
	
		if (this.taskAudio) {
			this.taskAudio.stop();
			this.taskAudio.destroy();
			this.taskAudio = null;
		}
	
		if (this.audio) {
			this.audio.stop();
			this.audio.destroy();
			this.audio = null;
		}
		
		if (this.correctAudio) {
			this.correctAudio.stop();
			this.correctAudio.destroy();
			this.correctAudio = null;
		}
		
		if (this.wrongAudio) {
			this.wrongAudio.stop();
			this.wrongAudio.destroy();
			this.wrongAudio = null;
		}
		
		if (this.alien) {
			this.alien.destroy();
			this.alien = null;
		}
	
		this.prefix = null;
		this.selectedItems = [];
		this.itemArray = [];
		this.taskArray = [];
		this.task = null;
	},
	
	
	startTask: function (task) {
		
		// Load task audio
		this.taskAudio = this.add.audio(this.prefix+'_t'+task.id+'_audio');
		
		// 
		
	},
	
	playSequence: function(soundArray) {
		soundArray[0].play();
		soundArray.forEach(function(element, index, array) {
			if (soundArray[index + 1]) {
				soundArray[index].onStop.addOnce(function() {
					soundArray[index + 1].play();
				}, this);
			}
		});
	},
	
	
	goToWorld: function (pointer) {
		//	Go back to world
		this.state.start('World');
	},
	
	
	// Check result
	play: function (pointer) {
		
		var result = 0;
		var correctItem = false;
		var taskItem = null;
		
		for(i = 0; i < this.selectedItems.length; i++)
		{
			for(j = 0; j < this.taskArray[this.task].items.length; j++)
			{
				taskItem = this.taskArray[this.task].items[j];
				
				// Check item
				if(taskItem.item != '') {
					if(this.itemArray[this.selectedItems[i]].name == taskItem.item) {
						correctItem = true;
					}
				}
				// Check category
				else if(taskItem.category != '') {
					for(k = 0; k < this.itemArray[this.selectedItems[i]].categories.length; k++) {
						if(this.itemArray[this.selectedItems[i]].categories[k] == taskItem.category) {
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
		if(result >= this.taskArray[this.task].items.length) {
			// Correct
			this.correctAudio.play();
			
			
			// TODO: Testing layers
			this.layer1.remove(this.alien);
			this.layer1.remove(this.cloud);
			this.layer2.add(this.alien);
			this.layer2.add(this.cloud);
			// Move items
			for(i = 0; i < this.selectedItems.length; i++)
			{
				this.layer1.remove(this.itemGroups[this.selectedItems[i]]);
				this.layer2.add(this.itemGroups[this.selectedItems[i]]);
			}
			
			this.layer2.visible = true;
			
			this.add.tween(this.overlay).to( { alpha: 1 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false);
		}
		else {
			// Wrong
			this.wrongAudio.play();
		}
		this.alien.talk(true);

	},
	
	itemDown: function (sprite) {
		
		// Item
		// sprite.scale.setTo(1.1);
//
// 		// Shadow
// 		this.shadows[sprite.listId].x = sprite.x+10;
// 		this.shadows[sprite.listId].y = sprite.y+10;
// 		this.shadows[sprite.listId].visible = true;
//
// 		// Bring group to top
// 		this.layer1.bringToTop(this.itemGroups[sprite.listId]);
		
		this.layer1.bringToTop(sprite);
	},
	itemUp: function (sprite) {

		// Item
		sprite.scale.setTo(1);
		
		// Shadow
		this.shadows[sprite.listId].visible = false;
		
		// Check if item in the list
		//var index = this.selectedItems.indexOf(this.itemArray[sprite.listId].name);
		var index = this.selectedItems.indexOf(sprite.listId);
		
		// Check if dropped on a cloud
		if(sprite.y > 600) {
			// Add item (if does not exist in the list)
			if(index == -1) {
				//this.selectedItems.push(this.itemArray[sprite.listId].name);
				this.selectedItems.push(sprite.listId);
			}
			// Fix in the cloud
			if(sprite.height > 140) {
				var ratio = 140 / sprite.height;
				sprite.scale.setTo(ratio);
			}
			sprite.y = 720;
		}
		else {
			// Remove item (if exists in the list)
			if(index > -1) {
				this.selectedItems.splice(index, 1);
			}
			// Move to initial position
			sprite.x = sprite.initX;
			sprite.y = sprite.initY;
		}
		
	},
	
	itemDrag: function (sprite) {

		// Shadow
		this.shadows[sprite.listId].x = sprite.x+10;
		this.shadows[sprite.listId].y = sprite.y+10;
	},
	
	
	
	
	
	
	alienUp: function (sprite) {

		this.alien.talk(true);
		this.playSequence([this.taskAudio, this.audio]);
	},
	soundStopped: function (sound) {
	
		this.alien.talk(false);
	},

};