GameObj.Room = function (game) {

	this.btnBack = null;
	
	this.itemGroups = [];
	this.items = [];
	this.shadows = [];
	
	// Create array for Items
	this.itemObj = [];
	
	this.audio = null;
	this.correctAudio = null;
	this.wrongAudio = null;
	this.orderAudio = null;
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
		
		
		// Add items
		for(i = 0; i < itemJson.items.length; i++)
		{
			// Create item
			this.itemObj[i] = new Item(this, 
				itemJson.items[i].x, 
				800-itemJson.items[i].y, 
				'w'+worldObj.id+'_r'+roomObj.id+'_atlas', 
				itemJson.items[i].name,
				i
			);
			this.add.existing(this.itemObj[i]);
			this.layer1.add(this.itemObj[i]);
			// Add events
			this.itemObj[i].events.onInputDown.add(this.itemDown, this);
			this.itemObj[i].events.onInputUp.add(this.itemUp, this);
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
		//this.correctAudio.onStop.add(this.soundStopped, this);
		this.wrongAudio = this.add.audio('wrong_audio');
		//this.wrongAudio.onStop.add(this.soundStopped, this);
		this.orderAudio = this.add.audio('order_audio');
		//this.orderAudio.onStop.add(this.soundStopped, this);
		
		
		// Overlay
		// var graphicOverlay = new Phaser.Graphics(this, 0, 0);
		// graphicOverlay.beginFill(0x24415c, 0.95);
		// graphicOverlay.drawRect(0,0, this.world.width, this.world.height);
		// graphicOverlay.endFill();
		
		var myBitmap = this.add.bitmapData(this.world.width, this.world.height);
		var grd=myBitmap.context.createLinearGradient(0,0,0,this.world.height);
		grd.addColorStop(0,'rgba(36,65,92,0.95)');
		grd.addColorStop(1,'rgba(16,29,41,1.0)');
		myBitmap.context.fillStyle=grd;
		myBitmap.context.fillRect(0,0,this.world.width,this.world.height);
		
		
		this.overlay = this.add.sprite(0,0,myBitmap);
		// this.overlay = this.add.sprite(0,0,graphicOverlay.generateTexture());
		this.overlay.inputEnabled = true;
		this.overlay.alpha = 0;
		this.layer2.add(this.overlay);
		
		// Destroy graphics
		// graphicOverlay.destroy();
		
		
		// // Add slots/boxes for items
		// var box = [];
		// var arrow = [];
		// var boxNum = 3;
		// var spacing = this.world.width / (boxNum+1);
		// for(i = 0; i < boxNum; i++) {
		// 	box[i] = this.add.sprite(spacing * (boxNum-i), 280, 'box');
		// 	box[i].anchor.set(0.5);
		// 	this.layer2.add(box[i]);
		//
		// 	if(i < (boxNum-1)) {
		// 		arrow[i] = this.add.sprite(spacing * (boxNum-i) - box[i].width/2+10, 280, 'arrow');
		// 		arrow[i].anchor.set(1, 0.5);
		// 		this.layer2.add(arrow[i]);
		// 	}
		// }
		
		
		this.box = new Box(this, 280);
		this.add.existing(this.box);
		this.layer2.add(this.box);
		
		
		
		// TODO: For testing choose random task
		var num = this.rnd.integerInRange(0, taskJson.tasks.length-1);
		this.startTask(taskJson.tasks[num]);
		this.task = num;
		
		// Update boxes
		this.box.setBoxes(this.taskArray[this.task].items.length);
		
		
		// Sound library
		this.sound = new Sound(this);
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
		
		if (this.orderAudio) {
			this.orderAudio.stop();
			this.orderAudio.destroy();
			this.orderAudio = null;
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
	
	
	playSequenceNew: function(soundArray, callback, delayStartCallback, delayEndCallback) {
		var timer = this.time.create();
		
		soundArray[0].play();
		soundArray.forEach(function(element, index, array) {
			
			if (typeof soundArray[index] == 'number') {	
				timer.add(soundArray[index], function() {
					soundArray[index + 1].play();
					return delayEndCallback();
				}, this);
			}
			else if (typeof soundArray[index + 1] == 'object') {
				soundArray[index].onStop.addOnce(function() {
					soundArray[index + 1].play();
				}, this);
			}
			else if (typeof soundArray[index + 1] == 'number') {	
				soundArray[index].onStop.addOnce(function() {
					timer.start();
					return delayStartCallback();
				}, this);
			}
			else {
				soundArray[index].onStop.addOnce(function() {
					return callback();
				}, this);
			}
		});
	},
	
	
	playSequence: function(soundArray, callback) {
		soundArray[0].play();
		soundArray.forEach(function(element, index, array) {
			if (typeof soundArray[index + 1] == 'object') {	
				soundArray[index].onStop.addOnce(function() {
					soundArray[index + 1].play();
				}, this);
			}
			else {
				soundArray[index].onStop.addOnce(function() {
					callback();
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
		
		var self = this;
		
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
			this.playSequence([this.correctAudio, this.orderAudio], function() {
				self.alien.talk(false);
			});
			
			// TODO: Testing layers
			this.layer1.remove(this.alien);
			this.layer1.remove(this.cloud);
			this.layer2.add(this.alien);
			this.layer2.add(this.cloud);
			// Bring box on top
			this.layer2.bringToTop(this.box);
			
			// Move items
			for(i = 0; i < this.selectedItems.length; i++)
			{
				this.layer1.remove(this.itemObj[this.selectedItems[i]]);
				
				//this.box.addItem(this.itemObj[this.selectedItems[i]]);
				this.layer2.add(this.itemObj[this.selectedItems[i]]);
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
	
	// Pick up item
	itemDown: function (sprite) {
		// Bring to frontt
		sprite.bringToTop();
	},
	
	// Put down item
	itemUp: function (sprite) {

		// Check if item in the list
		var index = this.selectedItems.indexOf(sprite.getId());
		
		// Check if dropped on a cloud
		if(sprite.y > 600) {
			// Add item (if does not exist in the list)
			if(index == -1) {
				this.selectedItems.push(sprite.getId());
			}
			// Fix in the cloud
			if(sprite.getHeight() > 140) {
				var ratio = 140 / sprite.getHeight();
				sprite.scale.setTo(ratio);
			}
			sprite.y = 720;
		}
		else {
			// TODO: Make states
			if(this.layer2.visible == false) {
				// Remove item (if exists in the list)
				if(index > -1) {
					this.selectedItems.splice(index, 1);
				}
				// Move to initial position
				sprite.resetPos();
			}
			else
			{
				// TODO: Testing
				this.box.checkOverlap(sprite);
			}
		}
		
	},
	
	alienUp: function (sprite) {

		var self = this;

		this.alien.talk(true);
		
		// TODO: Make states
		if(this.layer2.visible == false) {
			
			this.sound.playSequence(['correct_audio', 1000, 'order_audio', 1000, 'wrong_audio'], 
				function() {
					self.alien.talk(false);
				},
				function() {
					self.alien.talk(false);
				},
				function() {
					self.alien.talk(true);
				}
			);
			
			// this.playSequenceNew([this.taskAudio, 1000, this.audio],
// 				function() {
// 					self.alien.talk(false);
// 				},
// 				function() {
// 					self.alien.talk(false);
// 				},
// 				function() {
// 					self.alien.talk(true);
// 				}
// 			);
		}
		else {
			this.playSequence([this.taskAudio, this.orderAudio], function() {
				self.alien.talk(false);
			});
		}
	},
	
	soundStopped: function (sound) {
	
		this.alien.talk(false);
	},

};