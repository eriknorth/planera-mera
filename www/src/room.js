// TODO: Enable/disable buttons buggy


GameObj.Room = function (game) {
		
	this.prefix = null;
	

	this._itemArray = [];
	this._taskArray = [];
	
	
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
	this._layer3 = null;
	
	// Overlay
	this._overlay = null;
	
	// Array for Items
	this._items = [];
	
	// Buttons
	this._btnBack = null;
	this._btnPlay = null;
	
	// Star
	this._starOverly = null;
	this._star = null;
	this._btnOk = null;
	
	// Rocket items
	this._rocketItemArray = null;
	
	// extra
	this._room = null;
	
	// Level has door
	this._hasDoor = false;
	this._doors = [];
	
	// Star item
	this._starItem = null;
	this._starRocket = null;
	this._starArrow = null;
	
	this._tipCounter = 0;
	this._lastWasWrong = false;
	
	// Task history
	this._taskHistory = [];
	this._taskHistoryPtr = 0;
	
	
	
	this.LEVEL_DOWN_LIMIT = 1;
	this.TASK_WRONG_LIMIT = 5;
	this.OPEN_ROOM_LIMIT = 8;
	this.OLDER_TASK_PROBABILITY = 4;
	
	this.TASK_HISTORY_SIZE = 4;
};

GameObj.Room.prototype = {

	create: function () {
		
		var self = this;
		
		// Get JSONs
		var gameJson = this.cache.getJSON('game');
		var worldsJson = this.cache.getJSON('worlds');
		
		// Get main objects
		var worldObj = worldsJson.worlds[GameObj.world];
		var roomObj = worldObj.rooms[GameObj.room];
		this._room = roomObj;
		
		// Make prefix
		this.prefix = 'w'+worldObj.id+'_r'+roomObj.id;
		
		// Get itmes
		var itemJson = this.cache.getJSON(this.prefix + '_items');
		this._itemArray = itemJson.items;
		// Get tasks
		var taskJson = this.cache.getJSON(this.prefix + '_tasks');
		this._taskArray = taskJson.tasks;
		
		// Get rocket items
		var rocketItemJson = this.cache.getJSON('rocket_items');
		this._rocketItemArray = rocketItemJson.items;
		
		// Create layers
		this._layer1 = this.add.group();
		this._layer2 = this.add.group();
		this._layer1.visible = true;
		this._layer2.visible = false;
		
		// Background
		var background = this.add.sprite(0, 0, this.prefix + '_bg');
		this._layer1.add(background);
		
		// Cloud
		this._cloud = new Cloud(this, 0, 600);
		this.add.existing(this._cloud);
		this._layer1.add(this._cloud);
		this._cloud.depth = 100;
		
		// Alien
		this._alien = new Alien(this, 1150, 700);
		this.add.existing(this._alien);
		this._alien.inputEnabled = true;
		this._alien.events.onInputDown.add(this.alienClickRelease, this);
		this._layer1.add(this._alien);
		// TODO: testing
		this._alien.depth = 101;
		
		
		// Add items
		for(i = 0; i < itemJson.items.length; i++)
		{
			// Check if item is door
			var door = false;
			if(itemJson.items[i].categories.indexOf('door') > -1) {
				door = true;
				this._hasDoor = true;
			}
			
			// Create item
			this._items[i] = new Item(this, 
				itemJson.items[i].x, 
				800-itemJson.items[i].y, 
				this.prefix + '_atlas', 
				itemJson.items[i].name,
				i,
				door
			);
			this.add.existing(this._items[i]);
			this._layer1.add(this._items[i]);
			// Add events
			this._items[i].events.onInputDown.add(this.itemClickPress, this);
			this._items[i].events.onInputUp.add(this.itemClickRelease, this);
			
			if(door == true) {
				this._doors.push(this._items[i]);
			}
		}
		
		// Back button
		this._btnBack = this.add.button(60, 60, 'btnBack', this.goBack, this, 2, 0, 1);
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
		
		
		
		// --- < Star stuff > ---
		// Add extra layer
		this._layer3 = this.add.group();
		this._layer3.visible = false;
		this._layer3.alpha = 0;
		
		// Add overlay
		this._starOverlay = this.add.sprite(0, 0, overlayBitmap);
		this._starOverlay.inputEnabled = true;
		this._layer3.add(this._starOverlay);
		
		// Star
		this._star = this.game.add.sprite(this.world.centerX, this.world.centerY - 160, 'star');
		this._star.anchor.setTo(0.5);
		this._star.scale.setTo(0.1);
		this._star.y = this.world.centerY - 60;
		this._layer3.add(this._star);
		
		// Ok button
		this._btnOk = this.add.button(this.world.centerX, this.world.height - 80, 'btnOk', this.hideStar, this, 2, 0, 1);
		this._btnOk.anchor.set(0.5);
		this._layer3.add(this._btnOk);
		
		
		
		this._starRocket = this.game.add.sprite(this.world.centerX - 170, this.world.height - 250, 'rocket_icon');
		this._starRocket.anchor.setTo(0.5);
		this._starRocket.scale.setTo(0.5);
		this._layer3.add(this._starRocket);
		this._starRocket.visible = false;
		
		this._starArrow = this.game.add.sprite(this.world.centerX, this.world.height - 250, 'starArrow');
		this._starArrow.anchor.setTo(0.5);
		this._layer3.add(this._starArrow);
		this._starArrow.visible = false;
		
		
		// --- </ Star stuff > ---	
		
		
		
		
		// Add slots/_boxes for items
		this._box = new Box(this, 280);
		this.add.existing(this._box);
		this._layer2.add(this._box);
		
		
		// Sound library
		this._sound = new Sound(this);
		
		// Bring to top
		this._cloud.bringToTop();
		this._alien.bringToTop();
		
		// Give instruction
		this.giveInstruction(function () {
			// Start with delay
			setTimeout(function () {
				// Start New Task
				self.startNewTask(true);
			}, 500);
		});
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
		this._itemArray = [];
		this._taskArray = [];
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
		
		// Doors
		this._hasDoor = null;
		this._doors = [];
	},
	
	// TODO: Need to fix
	startNewTask: function (playTask) {
		
		var self = this;
		
		// Choose randomly a task from a pool (if there is any)
		// if(this._taskArray.length > 0) {
		// 	var rndNum = this.rnd.integerInRange(0, this._taskArray.length-1);
		// 	this._currTask = this._taskArray[rndNum];
		//
		//
		// 	// TODO: This should be done better
		// 	// Say task
		// 	this.alienClickRelease();
		// }
		
		// Increment tip counter
		this._tipCounter++;
		
		
		// Choose task
		this.chooseTask(function () {
			// TODO: This should be done better
			// Say task
			if(typeof playTask !== 'undefined' && playTask == true) {
				self.alienTalk();
			}
		});
		
		
	},
	
	goBack: function (pointer) {

		var self = this;
		
		// Save event
		GameObj.db.insertEvent(GameObj.user.id, 'click', 'room:' + GameObj.room, 'back');

		// If in the first state of the game -> can leave to world
		if (this._state == 0) {
			//	Go back to world
			this.state.start('World', true, false, 'room');
		}
		// Otherwise go back to state 1
		else {
			
			this.changeState(0);
			
		}
	},
	
	// Check result
	play: function (pointer) {
		
		var self = this;
		
		// Save event
		GameObj.db.insertEvent(GameObj.user.id, 'click', 'room:' + GameObj.room, 'play');
		
		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:
			// Play result
			if(this.checkFirstAnswer() == true) {
				
				
				
				
				// TODO: Check difficulty and depending on that process result...
				// Depending on difficulty, decide if should go to ordering
				if(this._currTask.difficulty == 0) {
					
					this.processResult(true, function (newTask, presentItem, firstPresent, levelUp) {
						// Feedback
						//self._alien.talk(true);
						// Disable buttons
						self.setButtonsActive(false);
						
						
						//self._sound.play('playButton_audio', function() {
							//self._alien.talk(false); 
							// Run with delay
							//setTimeout(function () {
								
								// Show star
								self.showStar(presentItem);
								if(presentItem != -1 && firstPresent == true) {
									// Feedback + present
									self._alien.talk(true);
									// Check if a new room has opened
									let audioList = ['positiveFeedback_audio', 500, 'gotRocketItem_audio'];
									if(levelUp) {
										audioList = ['positiveFeedback_audio', 500, 'gotRocketItem_audio', 500, 'newRoomOpen_audio'];
									}
									
									self._sound.playSequence(audioList, 
										function() { 
											self._alien.talk(false); 
											self.setButtonsActive(true);
											
											// Change state
											self.resetState(0);
										},
										function() { self._alien.talk(false); },
										function() { self._alien.talk(true); }
									);
								}
								else {
									// Feedback
									self._alien.talk(true);
									// Check if a new room has opened
									let audioList = ['positiveFeedback_audio'];
									if(levelUp) {
										audioList = ['positiveFeedback_audio', 500, 'newRoomOpen_audio'];
									}
									
									self._sound.playSequence(audioList, 
										function() { 
											self._alien.talk(false); 
											self.setButtonsActive(true);
											
											// Change state
											self.resetState(0);
										},
										function() { self._alien.talk(false); },
										function() { self._alien.talk(true); }
									);
									// self._sound.play('positiveFeedback_audio', function() {
// 										self._alien.talk(false);
// 										self.setButtonsActive(true);
//
// 										// Change state
// 										self.resetState(0);
// 									});
								}
								
								//}, 500);
						//});
						
						// self._sound.playSequence(['playButton_audio', 500, 'positiveFeedback_audio'],
// 							function() {
// 								self._alien.talk(false);
// 								self.setButtonsActive(true);
//
// 								// Show star
// 								self.showStar();
// 								// Change state
// 								self.resetState(0);
// 							},
// 							function() { self._alien.talk(false); },
// 							function() { self._alien.talk(true); }
// 						);
						
						
						// self._sound.play('positiveFeedback_audio', function() {
						// 	self._alien.talk(false);
						// 	// Change state
						// 	self.resetState(0);
						// });
					});
					
				}
				else {
					
					// TODO: maybe this should be in a better place
					this.saveAnswer(1);
					
					// Correct
					//this._alien.talk(true);
					// Disable buttons
					this.setButtonsActive(false);
					
					//this._sound.play('playButton_audio', function() {
						//self._alien.talk(false); 
						// Run with delay
						//setTimeout(function () {
							self._alien.talk(true);
							self._sound.playSequence(['positiveFeedback_audio', 500, 'orderInstruction_audio'], 
								function() { 
									self._alien.talk(false);
									self.setButtonsActive(true);
								},
								function() { self._alien.talk(false); },
								function() { self._alien.talk(true); }
							);
							// Generate boxes
							self._box.setBoxes(self._selectedItems.length);
		
							// Change state
							self.changeState(1);
							//}, 500);
					//});
				}
			}
			else {
				// -- Wrong --
				
				this.processResult(false, function (newTask) {
					
					if(newTask == true) {
						// TODO: Hensi says something about better luck next time
						self._alien.talk(true);
						// Disable buttons
						self.setButtonsActive(false);
						
						self._sound.playSequence(['negativeFeedback_audio', 500, 'betterLuckNextTime_audio'], 
						//self._sound.playSequence(['playButton_audio', 500, 'negativeFeedback_audio', 500, 'betterLuckNextTime_audio'], 
							function() { 
								self._alien.talk(false); 
								self.setButtonsActive(true);
						
								// Change state
								self.resetState(0);
								// Start new task
								self.startNewTask();
							},
							function() { self._alien.talk(false); },
							function() { self._alien.talk(true); }
						);

					}
					else {
						// Just say that it is wrong
						self._alien.talk(true);
						// Disable buttons
						self.setButtonsActive(false);
						
						self._sound.play('negativeFeedback_audio', function() { 
							self._alien.talk(false); 
							self.setButtonsActive(true); 
						});
						/*self._sound.playSequence(['playButton_audio', 500, 'negativeFeedback_audio'], 
							function() { 
								self._alien.talk(false); 
								self.setButtonsActive(true); 
							},
							function() { self._alien.talk(false); },
							function() { self._alien.talk(true); }
						);*/
					
						// self._sound.play('somethingIsMissing_audio', function() {
// 							self._alien.talk(false);
// 						});
					}
					
				});
			}
			break;
		case 1:
			
			// Play result
			if(this.checkSecondAnswer() == true) {
				// Correct
				
				this.processResult(true, function (newTask, presentItem, firstPresent, levelUp) {
				
					// Show star
					self.showStar(presentItem);
				
					// Feedback
					self._alien.talk(true);
					// Disable buttons
					self.setButtonsActive(false);
					
					if(presentItem != -1 && firstPresent == true) {
						// Feedback + present
						self._alien.talk(true);
						self._sound.playSequence(['positiveFeedback_audio', 500, 'gotRocketItem_audio'], 
							function() { 
								self._alien.talk(false); 
								self.setButtonsActive(true); 
								
								// Change state
								self.changeState(0, function() {
									// Start new task
									// self.startNewTask();
								});	
							},
							function() { self._alien.talk(false); },
							function() { self._alien.talk(true); }
						);
					}
					else {
						self._sound.play('positiveFeedback_audio', function() { 
							self._alien.talk(false);
							self.setButtonsActive(true); 
					
							// Change state
							self.changeState(0, function() {
								// Start new task
								// self.startNewTask();
							});		
						});
					}
				});
			
			}
			else {
				// -- Wrong --
				
				this.processResult(false, function (newTask) {
					
					if(newTask == true) {
						// TODO: Hensi says something about better luck next time
						self._alien.talk(true);
						// Disable buttons
						self.setButtonsActive(false);
						
						self._sound.playSequence(['negativeFeedback_audio', 500, 'betterLuckNextTime_audio'], 
							function() { 
								self._alien.talk(false);
								self.setButtonsActive(true);
					
								// Change state
								self.changeState(0, function() {
									// Start new task
									self.startNewTask();
								});
							},
							function() { self._alien.talk(false); },
							function() { self._alien.talk(true); }
						);
					}
					else {
						// Just say that it is wrong
						self._alien.talk(true);
						// Disable buttons
						self.setButtonsActive(false);
						
						self._sound.play('theOrderIsNotCorrect_audio', function() { 
							self._alien.talk(false);
							self.setButtonsActive(true);
						});
					}
					
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

		var self = this;

		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:

			// Check if item in the list
			var index = this._selectedItems.indexOf(item.getId());
			
			if(this._cloud.checkOverlap(item) == true || this._alien.checkOverlap(item) == true) {
				
				// Put in the cloud only if there are less than 6 items
				if(this._selectedItems.length < 6 || index > -1) {
					// Put in cloud
					this._cloud.putInCloud(item);
					item.depth = 200;
				
					// Add item (if does not exist in the list)
					if(index == -1) {
						this._selectedItems.push(item.getId());
					}
				}
				else {
					// Too many items
					// Feedback
					self._alien.talk(true);
					// Disable buttons
					self.setButtonsActive(false);
					self._sound.play('tooManyItems_audio', function() {
						self._alien.talk(false);
						self.setButtonsActive(true);
					});
					
					// Move to initial position
					item.resetPos();
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
		
		this._layer1.sort('depth', Phaser.Group.SORT_ASCENDING);
	},
	
	
	alienClickRelease: function (sprite) {
		
		// Save event
		GameObj.db.insertEvent(GameObj.user.id, 'click', 'room:' + GameObj.room, 'alien');
		
		this.alienTalk();
	},
	
	
	// Click on _alien (release)
	alienTalk: function () {

		var self = this;

		// Start talking animation
		this._alien.talk(true);
		
		// Disable buttons
		this.setButtonsActive(false);
		
		// Play audio depending on the gameplay state
		switch(this._state)
		{
		case 0:
			
			// if(this._hasDoor == true && GameObj.level.level == 0) {
	// 			this._sound.playSequence([
	// 				'doPlanning_audio',
	// 				this.prefix + '_t' + this._currTask.id + '_audio'
	// 			],
	// 				function() { self._alien.talk(false); self.setButtonsActive(true); },
	// 				function() { self._alien.talk(false); },
	// 				function() { self._alien.talk(true); }
	// 			);
	// 		}
	// 		else {
				if(this._lastWasWrong == true) {
					// Reset
					this._lastWasWrong = false;

					this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio', 200,'aTip_audio'],
						function() { self._alien.talk(false); self.setButtonsActive(true); },
						function() { self._alien.talk(false); },
						function() { self._alien.talk(true); }
					);
				}
				else {
					this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio'], 
						function() { self._alien.talk(false); self.setButtonsActive(true); },
						function() { self._alien.talk(false); },
						function() { self._alien.talk(true); }
					);
				}
				
			// }
			break;
		case 1:
			this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio', 200, 'orderInstruction_audio'], 
				function() { self._alien.talk(false); self.setButtonsActive(true); },
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
		var itemsPresent = 0;
		var itemIsHere = false;
		
		if(this._selectedItems.length == 0) {
			// Wrong	
			return false;
		}
		
		
		// Check if all task items are present
		
		var usedItems = [];
		for(i = 0; i < this._currTask.items.length; i++)
		{
			taskItem = this._currTask.items[i];
			itemIsHere = false;
			
			for(j = 0; j < this._selectedItems.length; j++)
			{
				if(usedItems.indexOf(j) > -1) {
					continue;
				}
				
				// Check item
				//console.log(this._itemArray[this._selectedItems[j]].name, taskItem.item);
				if(taskItem.item != '') {
					if(this._itemArray[this._selectedItems[j]].name == taskItem.item) {
						itemsPresent++;
						usedItems.push(j);
						itemIsHere = true;
						break;
					}
				}
				// Check category
				else if(taskItem.category != '') {
					var catMatch = 0;
					for(k = 0; k < this._itemArray[this._selectedItems[j]].categories.length; k++) {
						if(this._itemArray[this._selectedItems[j]].categories[k] == taskItem.category) {
							catMatch++;
						}
					}
					
					
					// TODO: THIS IS A BIG HACK
					var correct = false;
					for(var n = i+1; n < this._currTask.items.length; n++) {
						if(this._currTask.items[n].item == this._itemArray[this._selectedItems[j]].name) {
							correct = true;
						}
					}
					if(correct == true) {
						continue;
					}
					
					
					// TODO: Debug this
					// if(catMatch == this._itemArray[this._selectedItems[j]].categories.length) {
// 						itemsPresent++;
// 						break;
// 					}
					if(catMatch > 0) {
						itemsPresent++;
						usedItems.push(j);
						itemIsHere = true;
						break;
					}
				}
			}
			
			// Check the 66 case (item optional)
			if(taskItem.order == 66 && itemIsHere == false) {
				itemsPresent++;
			}
		}
		
		// Check if items are OK
		for(i = 0; i < this._selectedItems.length; i++)
		{
			for(j = 0; j < this._currTask.items.length; j++)
			{
				taskItem = this._currTask.items[j];
				
				// Check item
				if(taskItem.item != '') {
					if(this._itemArray[this._selectedItems[i]].name == taskItem.item) {
						correctItem = true;
					}
				}
				// Check category
				else if(taskItem.category != '') {
					for(k = 0; k < this._itemArray[this._selectedItems[i]].categories.length; k++) {
						if(this._itemArray[this._selectedItems[i]].categories[k] == taskItem.category) {
							correctItem = true;
						}
					}
				}
			}
			
			if(correctItem == false || itemsPresent < this._currTask.items.length) {
				result = -1;
				break;
			}
			else {
				result++;
				correctItem = false;
			}
		}
		
		
		// Return result
		if(result >= this._selectedItems.length) {
			// Correct
			return true;
		}
		else {
			// Wrong	
			return false;
		}
		
	},
	
	// Check second part answer
	checkSecondAnswer: function () {
		
		var itemOrder = this._box.getOrder();
		
		// Check if all items has been used
		if(itemOrder.indexOf(-1) != -1) {
			return false;
		}
		
		// Sort by order
		this._currTask.items.sort(function(a, b){
			return a.order - b.order;
		})
		
		// Set initial order position
		var currPosI = 0;
		var currPos = this._currTask.items[currPosI].order;
		var result = 0;
		var correctItem = false;
		var correctOrder = false;
		
		// Check all boxes
		for(i = 0; i < itemOrder.length; i++)
		{
			// Current order
			while(currPos == 0 || currPos == 66) {
				currPosI++;
				//if(currPosI < this._currTask.items.length) {
					currPos = this._currTask.items[currPosI].order;
					//}
			}
			
			if(currPosI < this._currTask.items.length) {
				currPos = this._currTask.items[currPosI].order;
			}
			
			for(j = 0; j < this._currTask.items.length; j++)
			{
				taskItem = this._currTask.items[j];
				
				// Check item
				if(taskItem.item != '') {
					if(this._itemArray[itemOrder[i]].name == taskItem.item) {
						correctItem = true;
						
						if(taskItem.order != 0 && taskItem.order != 66) {
							currPosI++;
						}
					}
				}
				// Check category
				else if(taskItem.category != '') {
					for(k = 0; k < this._itemArray[itemOrder[i]].categories.length; k++) {
						if(this._itemArray[itemOrder[i]].categories[k] == taskItem.category) {
							correctItem = true;
						}
					}
					
					
					if(correctItem == true) {
						// Check if next item in task has same cattegory but it has item name defined
						// is there a next item?
						if((currPosI+1) < this._currTask.items.length) {
							// Has same category but has also item name?
							if(this._currTask.items[currPosI+1].item == '') {
							
								// If not, only then consider it as duplicate...
								// Increment position only if next items are not same category
								if(correctItem == true) {
									var correct = false;
									for(var n = i+1; n < itemOrder.length; n++) {
										for(k = 0; k < this._itemArray[itemOrder[n]].categories.length; k++) {
											if(this._itemArray[itemOrder[n]].categories[k] == taskItem.category) {
												correct = true;
											}
										}
									}
					
									// Increment only if there are no other with the same category
									if(correct == false) {
										if(taskItem.order != 0 && taskItem.order != 66) {
											currPosI++;
										}
									}
								}
							
							}
							else {
								if(taskItem.order != 0 && taskItem.order != 66) {
									currPosI++;
								}
							}
							
						}
					}

				}
				
				
				if(correctItem == true) {
					if(currPos == taskItem.order) {
						correctOrder = true;
					}
					else if(taskItem.order == 0 || taskItem.order == 66) {
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
		if(result >= itemOrder.length) {
			return true;
		}
		else {
			return false;
		}
	},
	
	resetState: function (state) {
		
		// Return if no current state
		if(this._state != state) return;
		
		// Change state
		if(this._state == 0) {
			
			// Move items
			for(var i = 0; i < this._selectedItems.length; i++)
			{
				this._layer2.remove(this._items[this._selectedItems[i]]);
				this._layer1.add(this._items[this._selectedItems[i]]);
			
				this._items[this._selectedItems[i]].resetPos();
				this._items[this._selectedItems[i]].alpha = 0;
				
				this.add.tween(this._items[this._selectedItems[i]]).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
			}
			
			// Clear selected item list
			this._selectedItems = [];
			
			// Close door
			for(var i = 0; i < this._doors.length; i++)
			{
				this._doors[i].closeDoor();
			}
			
			this._layer1.sort('depth', Phaser.Group.SORT_ASCENDING);
		}
		
	},
	
	changeState: function (state, callback) {
		
		// Do nothing if state is the same
		if(this._state == state) return;
		
		var self = this;
		
		// Change state
		if(this._state == 0) {
			
			// Switch layers for alien and cloud
			this._layer1.remove(this._cloud);
			this._layer1.remove(this._alien);
			this._layer2.add(this._cloud);
			this._layer2.add(this._alien);
			// Bring _box on top
			this._layer2.bringToTop(this._box);
		
			// Move items
			for(i = 0; i < this._selectedItems.length; i++)
			{
				this._layer1.remove(this._items[this._selectedItems[i]]);
				this._layer2.add(this._items[this._selectedItems[i]]);
			}
		
			this._layer2.visible = true;
			
			// Animate
			var tween = this.add.tween(this._overlay).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
			
			// One animation end
			tween.onComplete.add(function() {
			
				// Set new state
				self._state = 1;
				
				// Callback to know that state change has been complete
				typeof callback === 'function' && callback();
			}, this);
			
		}
		else {
			// Temporary overlay change
			this._layer2.remove(this._overlay);
			this._layer1.add(this._overlay);	
			
			// Switch layers for alien and cloud
			this._layer2.remove(this._cloud);
			this._layer2.remove(this._alien);
			this._layer1.add(this._cloud);	
			this._layer1.add(this._alien);		
		
			// Animate
			var tween = this.add.tween(this._layer2).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
			this.add.tween(this._overlay).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
			
			// One animation end
			tween.onComplete.add(function() {
				
				// Switch overlay back
				this._layer1.remove(this._overlay);
				this._layer2.add(this._overlay);
				
				self._layer2.visible = false;
				self._layer2.alpha = 1;	
				
				// // Move items
// 				for(i = 0; i < this._selectedItems.length; i++)
// 				{
// 					this._layer2.remove(this._items[this._selectedItems[i]]);
// 					this._layer1.add(this._items[this._selectedItems[i]]);
//
// 					this._items[this._selectedItems[i]].resetPos();
// 					this._items[this._selectedItems[i]].alpha = 0;
// 					this.add.tween(this._items[this._selectedItems[i]]).to( { alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
// 				}
//
// 				// Clear selected item list
// 				this._selectedItems = [];
				
				// Set new state
				self._state = 0;
				
				self.resetState(self._state);
				
				// Callback to know that state change has been complete
				typeof callback === 'function' && callback();
				
			}, this);
		}
	},

	// TODO: Need to implement this
	chooseTask: function (callback) {
		
		var self = this;
		
		// First try to get task from DB
		GameObj.db.getTask(GameObj.user.id, GameObj.level.id, function (res) {
			
			// If no result returned -> there is not task started
			if(res.rows.length == 0) {
				
				// Choose new task...
				
				// Make sure there are any tasks to handle
				if(self._taskArray.length > 0) {
				
				var levelTasks = [];
				
				// Choose if it is current level or some of the old tasks
					var rndNum = self.rnd.integerInRange(0, 10);
					// If 80% current level OR level is 0 as there are now lower levels
					// Make sure that difficulty is not more than 3
					var levelDifficulty = GameObj.level.level;
					if(levelDifficulty > 3) {
						levelDifficulty = 3;
					}
					
					if(rndNum > this.OLDER_TASK_PROBABILITY || levelDifficulty == 0) {
						levelTasks = self._taskArray.filter(function (obj) {
							return obj.difficulty === levelDifficulty;
						});
					}
					else {
						// If 20% then old ones...
						levelTasks = self._taskArray.filter(function (obj) {
							return obj.difficulty < levelDifficulty;
						});
					}
								
				
					// TODO: Make sure that selected task is not the same as previous
					// Try to do it 10 times if do not manage... continue with same task (maybe there is just one task)
					// Check if there was any previous
					var selectionFailed = true;
					
					if(self._currTask != null) {
												
						for(var i = 0; i < 10; i++) {
					
							var rndTask = self.rnd.integerInRange(0, levelTasks.length-1);
					
							// Choose tasks with history only if there are many tasks
							if(levelTasks.length > 2) {
					
								// Check if task has been played recently
								if(self._taskHistory.indexOf(levelTasks[rndTask].id) > -1) {
									continue;
								}
								else {
									selectionFailed = false;
									//console.log(self._taskHistory);
									self._taskHistory[self._taskHistoryPtr] = levelTasks[rndTask].id;
									self._taskHistoryPtr = (self._taskHistoryPtr + 1) % self.TASK_HISTORY_SIZE;
								
									self._currTask = levelTasks[rndTask];
									break;
								}
							}
							// Otherwise choose the tasks by taking possibly well
							else {
								if(self._currTask.id == levelTasks[rndTask].id) {
									continue;
								}
								else {
									self._currTask = levelTasks[rndTask];
									break;
								}
							}
						}
						
						// TODO: This is a hack! Selection failed...
						if(selectionFailed == true) {
							// Pick a task the old way
							for(var i = 0; i < 10; i++) {
								var rndTask = self.rnd.integerInRange(0, levelTasks.length-1);
								if(self._currTask.id == levelTasks[rndTask].id) {
									continue;
								}
								else {
									self._currTask = levelTasks[rndTask];
									break;
								}
							}
						}
					}
					else {
						var rndTask = self.rnd.integerInRange(0, levelTasks.length-1);
						self._currTask = levelTasks[rndTask];
					}
					

				}
				
				// Insert task entry in DB
				GameObj.db.insertTask(GameObj.user.id, GameObj.level.id, self._currTask.id, self._currTask.difficulty, function (id) {
					// Save task in game object
					GameObj.task = {
						id: id, 
						user_id: GameObj.user.id, 
						level_id: GameObj.level.id, 
						task: self._currTask.id, 
						wrong: 0, 
						value: 0, 
						timestamp: Date.now()
					};
					
					// Run callback if defined
					typeof callback === 'function' && callback();
				});
				
			}
			// There is a task started
			else {
				
				// TODO: Test tasks... always gets this...
				// var task = res.rows.item(0);
				// task.task = 200;
				// GameObj.task = task;
				
				// Save task in game object
				GameObj.task = res.rows.item(0);
				
				// Load task in the object
				self._currTask = self._taskArray.filter(function (obj) {
					return obj.id === GameObj.task.task;
				})[0];
				
				// Run callback if defined
				typeof callback === 'function' && callback();
			}
		});

	},
	
	showStar: function (presentItem) {
		
		var self = this;
		
		if(presentItem != -1) {
			
			// Move star upwards
			this._star.y = this.world.centerY - 160;
			
			// Item
			this._starItem = this.game.add.sprite(this.world.centerX + 200, this.world.height - 250, 'rocket_atlas', this._rocketItemArray[presentItem].name);
			this._starItem.anchor.setTo(0.5);
			this._layer3.add(this._starItem);
			
			// Scale to fit
			var size = 200;
			if(this._starItem.width >= this._starItem.height) {
				// Scale to fit in width
				if(this._starItem.width > size) {
					var ratio = size / this._starItem.width;
					this._starItem.scale.setTo(ratio);
				}
			}
			else {
				// Scale to fit in height
				if(this._starItem.height > size) {
					var ratio = size / this._starItem.height;
					this._starItem.scale.setTo(ratio);
				}
			}
			
			this._starRocket.visible = true;
			this._starArrow.visible = true;
			
		}
		else {
			this._star.y = this.world.centerY - 60;
			this._starRocket.visible = false;
			this._starArrow.visible = false;
		}
		
		
		this._layer3.visible = true;
		
		// Animate
		this.add.tween(this._layer3).to({alpha: 1}, 500, Phaser.Easing.Exponential.None, true);
		this.add.tween(this._star.scale).to({x: 1, y: 1}, 500, Phaser.Easing.Exponential.None, true);
	},
	
	hideStar: function (callback) {
		
		var self = this;
		
		// Save event
		GameObj.db.insertEvent(GameObj.user.id, 'click', 'room:' + GameObj.room, 'star');
		
		// Animate
		var tween = this.add.tween(this._layer3).to({alpha: 0}, 250, Phaser.Easing.Exponential.None, true);
		
		// One animation end
		tween.onComplete.add(function() {
		
			// Destroy present item
			if(this._starItem != null) {
				// TODO: testing
				//console.log('destroy item');
				this._starItem.destroy();
			}
		
			// Hide layer
			self._layer3.visible = false;
			
			// Start new task
			self.startNewTask();
			
			// Callback to know that state change has been complete
			typeof callback === 'function' && callback();
			
		}, this);
	},
	
	processResult: function (correct, callback) {
	
		var levelUp = false;
	
		if(correct == true) {
			// Correct answer
			this.saveAnswer(1);
			
			// Update task value
			GameObj.task.value = 1;
			GameObj.db.setTaskValue(GameObj.task.id, 1);
			// Reset tasks failed
			GameObj.level.failed = 0;
			GameObj.db.clearLevelFailed(GameObj.level.id);
			// Update level cleared
			GameObj.level.cleared++;	
			// Check if should level up
			if(GameObj.level.cleared >= 3) {
				// Reset tasks cleared
				GameObj.level.cleared = 0;
				GameObj.db.clearLevelCleared(GameObj.level.id);
				// Level up
				GameObj.level.level++;
				GameObj.db.incLevel(GameObj.level.id);
			}
			else {
				// Inc. tasks cleared
				GameObj.db.incLevelCleared(GameObj.level.id);
			}
			
			// Update cleared total
			GameObj.level.cleared_total++;
			GameObj.db.incLevelClearedTotal(GameObj.level.id);
			
			// Check if should level up
			if(GameObj.level.cleared_total >= this.OPEN_ROOM_LIMIT && GameObj.user.level <= this._room.level) {
				GameObj.user.level++;
				GameObj.db.incUserLevel(GameObj.user.id);
				levelUp = true;
				console.log("LEVEL UP");
			}
			
			// Give present in the rocket
			this.givePresent(function (presentItem, firstPresent) {
				// Give positiive feedback	
				// Callback to know that state change has been complete
				typeof callback === 'function' && callback(true, presentItem, firstPresent, levelUp);
			});
		}
		else {
			// Wrong answer
			this.saveAnswer(0);
			
			// Increase wrong counter
			GameObj.task.wrong++;
			// Update DB
			GameObj.db.incTaskWrong(GameObj.task.id);
			
			// Check how many errors has been made
			if(GameObj.task.wrong < this.TASK_WRONG_LIMIT) {
				
				// Still ok to continue
				// Feedback about wrong should be given
				
				// Callback to know that state change has been complete
				typeof callback === 'function' && callback(false, -1)
			}
			else {
				// Update value
				GameObj.task.value = -1;
				GameObj.db.setTaskValue(GameObj.task.id, -1);
				// Reset tasks cleared
				GameObj.level.cleared = 0;
				GameObj.db.clearLevelCleared(GameObj.level.id);
				// Update failed total
				GameObj.level.failed_total++;
				GameObj.db.incLevelFailedTotal(GameObj.level.id);
				// Update Failed levels
				GameObj.level.failed++;
				// Check if should level down
				if(GameObj.level.failed >= this.LEVEL_DOWN_LIMIT) {
					// Reset tasks failed
					GameObj.level.failed = 0;
					GameObj.db.clearLevelFailed(GameObj.level.id);
					// Level down
					GameObj.level.level--;
					GameObj.db.decLevel(GameObj.level.id);
				}
				else {
					// Inc. tasks cleared
					GameObj.db.incLevelFailed(GameObj.level.id);
				}
				
				// Wrong
				this._lastWasWrong = true;
				
				// Hensi says something about better luck next time. Change state and give new task
				// Callback to know that state change has been complete
				typeof callback === 'function' && callback(true, -1)
			}
		}
	},
	
	saveAnswer: function (answer) {
		
		var self = this;
		
		var tempSelect = this._selectedItems;
		var tempOrder = this._box.getOrder();;
		var state = this._state;
		
		GameObj.db.insertAnswer(GameObj.user.id, GameObj.task.id, state, answer, function (answerId) {
			
			// Save all selected items
			if(state == 0) {
				for(var i = 0; i < tempSelect.length; i++) {
					GameObj.db.insertAnswerItem(GameObj.user.id, answerId, 0, self._itemArray[tempSelect[i]].name);
				}
			}
			else {
				for(var i = 0; i < tempOrder.length; i++) {
					if(tempOrder[i] != -1) {
						GameObj.db.insertAnswerItem(GameObj.user.id, answerId, i, self._itemArray[tempOrder[i]].name);
					}
				}
			}
			
		});
		
	},
	
	givePresent: function (callback) {
		
		var self = this;

		GameObj.db.getRocketItems(GameObj.user.id, function (res) {
			
			var rndNum = -1;
			
			// If no result returned -> no items in rocket yet
			if(res.rows.length == 0) {
				rndNum = self.rnd.integerInRange(0, self._rocketItemArray.length-1);
				GameObj.db.insertRocketItem(GameObj.user.id, rndNum);
				
				// Run callback
				typeof callback === 'function' && callback(rndNum, true);
			}
			else {
				// If there is an item, then randomly try to pick one that is not there already
				var rocketItems = [];
				for(var i = 0; i < res.rows.length; i++) {
					rocketItems.push(res.rows.item(i).item);
				}
			
				do {
					rndNum = self.rnd.integerInRange(0, self._rocketItemArray.length-1);
				}
				while (rocketItems.indexOf(rndNum) > -1)

				// If 10 minutes have passed -> give a present
				if(Date.now() - res.rows.item(0).timestamp > (1000 * 60 * 10)) {
					GameObj.db.insertRocketItem(GameObj.user.id, rndNum);
					
					// Run callback
					typeof callback === 'function' && callback(rndNum, false);
				}
				else {
					// Else run callback with no item
					typeof callback === 'function' && callback(-1, false);
				}
			}
		});
	},

	giveInstruction: function (callback) {
		
		var self = this;
		
		// Start talking animation
		this._alien.talk(true);
		this.setButtonsActive(false);
		
		this._sound.play('instructionRoom_audio', function() { 
			self._alien.talk(false);
			// self.setButtonsActive(true);
			
			// Callback to know that state change has been complete
			typeof callback === 'function' && callback();
		});
	},
	
	// Enable / Disable buttons
	setButtonsActive: function (state) {
		
		if(state == true) {
			this._btnPlay.alpha = 1;
			this._btnBack.alpha = 1;
			this._btnOk.alpha = 1;
			this._btnPlay.inputEnabled = true;
			this._btnBack.inputEnabled = true;
			this._btnOk.inputEnabled = true;
		}
		else {
			this._btnPlay.alpha = 0.5;
			this._btnBack.alpha = 0.5;
			this._btnOk.alpha = 0.2;
			this._btnPlay.inputEnabled = false;
			this._btnBack.inputEnabled = false;
			this._btnOk.inputEnabled = false;
		}
	},

	// TODO: This is for testing framerate
	// render: function () {
	// 	this.game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
	// }
};