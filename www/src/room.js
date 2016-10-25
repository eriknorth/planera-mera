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
	
	// First task time
	this._firstTaskTime = 0;
	
	
	// Special feedback tasks
	this.SPECIAL_FEEDBACK_TASKS = [401, 402, 412, 416, 434, 435];
	this.SPECIAL_FEEDBACK_ENDS_AFTER_MINS = 30;
	
	// Positive audio names
	this.POSITIVE_FEEDBACK_AUDIO_NAMES = ['positiveFeedback_audio', 'positiveFeedback2_audio', 'positiveFeedback3_audio'];
	
	
	this.LEVEL_DOWN_LIMIT = 2;
	this.TASK_WRONG_LIMIT = 8;
	this.LEVEL_UP_LIMIT = 6;
	this.OPEN_ROOM_LIMIT = 15;
	this.OLDER_TASK_PROBABILITY = 4; // 40% probability
	
	this.TASK_HISTORY_SIZE = 4;
	
	this.TIP_PLAYS_AFTER_COUNT = 12;
	
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
		
		
		
		
		
		
		// Get time of the first task played... 
		GameObj.db.getFirstTask(GameObj.user.id, function (res) {
			
			// If no result returned -> set current time
			if(res.rows.length == 0) {
				self._firstTaskTime = Date.now();
			}
			else {
				self._firstTaskTime = res.rows.item(0).timestamp;
			}
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
		
		// Randomly choose positive feedback audio
		var positiveFeedbackAudio = this.POSITIVE_FEEDBACK_AUDIO_NAMES[self.rnd.integerInRange(0, 2)];
		
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
									var audioList = [positiveFeedbackAudio, 500, 'gotRocketItem_audio'];
									if(levelUp) {
										audioList = [positiveFeedbackAudio, 500, 'gotRocketItem_audio', 500, 'newRoomOpen_audio'];
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
									var audioList = [positiveFeedbackAudio];
									if(levelUp) {
										audioList = [positiveFeedbackAudio, 500, 'newRoomOpen_audio'];
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
							self._sound.playSequence([positiveFeedbackAudio, 500, 'orderInstruction_audio'], 
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
						
						// Check if a new room has opened
						var audioList = [positiveFeedbackAudio, 500, 'gotRocketItem_audio'];
						if(levelUp) {
							audioList = [positiveFeedbackAudio, 500, 'gotRocketItem_audio', 500, 'newRoomOpen_audio'];
						}
						
						self._sound.playSequence(audioList, 
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
						
						
						// Check if a new room has opened
						var audioList = [positiveFeedbackAudio];
						if(levelUp) {
							audioList = [positiveFeedbackAudio, 500, 'newRoomOpen_audio'];
						}
						
						self._sound.playSequence(audioList, 
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
						
						// Check if special task can be played
						if((Date.now() - self._firstTaskTime) > self.SPECIAL_FEEDBACK_ENDS_AFTER_MINS * 60 * 1000) {
							// Time passed -> play normal
							self._sound.play('theOrderIsNotCorrect_audio', function() { 
								self._alien.talk(false);
								self.setButtonsActive(true);
							});
						}
						else {
							// Check if special task 
							if(self.SPECIAL_FEEDBACK_TASKS.indexOf(self._currTask.id) > -1) {
								// Special task... play feedback
								self._sound.playSequence(['theOrderIsNotCorrect_audio', 500, 'glassDrinkFeedback_audio'], 
									function() { 
										self._alien.talk(false);
										self.setButtonsActive(true);
									},
									function() { self._alien.talk(false); },
									function() { self._alien.talk(true); }
								);
							}
							else {
								// Otherwise as usual
								self._sound.play('theOrderIsNotCorrect_audio', function() { 
									self._alien.talk(false);
									self.setButtonsActive(true);
								});
							}
						}
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
				if(this._lastWasWrong == true || this._tipCounter == this.TIP_PLAYS_AFTER_COUNT) {
					// Reset
					this._lastWasWrong = false;
					
					// Reset tip counter
					if(this._tipCounter == this.TIP_PLAYS_AFTER_COUNT) {
						this._tipCounter = 0;
					}
					
					var audioArray = ['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio', 200,'aTip_audio'];
					if(this._currTask.difficulty == 0) {
					    audioArray = [this.prefix + '_t' + this._currTask.id + '_audio', 200,'aTip_audio'];
					}
					
					this._sound.playSequence(audioArray,
					//this._sound.playSequence([this.prefix + '_t' + this._currTask.id + '_audio', 200,'aTip_audio'],
					// this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio', 200,'aTip_audio'],
						function() { self._alien.talk(false); self.setButtonsActive(true); },
						function() { self._alien.talk(false); },
						function() { self._alien.talk(true); }
					);
				}
				else {
				
				    var audioArray = ['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio'];
					if(this._currTask.difficulty == 0) {
					    audioArray = [this.prefix + '_t' + this._currTask.id + '_audio'];
					}
					
					this._sound.playSequence(audioArray,
					//this._sound.playSequence([this.prefix + '_t' + this._currTask.id + '_audio'], 
					// this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio'], 
						function() { self._alien.talk(false); self.setButtonsActive(true); },
						function() { self._alien.talk(false); },
						function() { self._alien.talk(true); }
					);
				}
				
			// }
			break;
		case 1:
			this._sound.playSequence([this.prefix + '_t' + this._currTask.id + '_audio', 200, 'orderInstruction_audio'], 
			// this._sound.playSequence(['doPlanning_audio', this.prefix + '_t' + this._currTask.id + '_audio', 200, 'orderInstruction_audio'], 
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
		
		var self = this;
		
		if(self._selectedItems.length == 0) {
			// Wrong	
			return false;
		}
		
		// Check if there are minimum of items required
		var currTaskWOOptionals = self._currTask.items.filter(function(obj) {
		    return obj.optional != true;
		});
		if(self._selectedItems.length < currTaskWOOptionals.length) {
			return false;
		}
		
		// Reset task item status
		var taskItemStatus = [];
		for(var i = 0; i < self._currTask.items.length; i++) {
			if(self._currTask.items[i].optional == true) {
				// Optional are covered...
				taskItemStatus[i] = 1;
			}
			else {
				taskItemStatus[i] = 0;
			}
		}
		
		
		
		// Loop through all selected items
		for(var i = 0; i < self._selectedItems.length; i++)
		{
			// Get item
			var selectedItem = self._itemArray[self._selectedItems[i]];
			var valid = false;
			
			// Check if item is valid within the task
			for(var j = 0; j < self._currTask.items.length; j++) {
				
				var taskItem = self._currTask.items[j];
				
				// Check items name
				if(taskItem.item != "") {
					if(taskItem.item == selectedItem.name) {
						valid = true;
						taskItemStatus[j]++;
					}
				}
				// Check category
				else {
					if(selectedItem.categories.indexOf(taskItem.category) > -1) {
						valid = true;
						taskItemStatus[j]++;
					}
				}
			}
		
			if(valid == false) {
				// Wrong
				return false
			}
		}
		
		if(taskItemStatus.indexOf(0) > -1) {
			return false;
		}
		
		return true;
		
	},
	
	// Check second part answer
	checkSecondAnswer: function () {
		
		var self = this;
		
		var itemOrder = this._box.getOrder();
	
		// Check if all items has been used
		if(itemOrder.indexOf(-1) != -1) {
			return false;
		}
	
	
		// Reset item order status
		var itemOrderStatus = [];
		for(var i = 0; i < itemOrder.length; i++) {
			itemOrderStatus[i] = 0;
		}
	
	
		// Sort by order
		self._currTask.items.sort(function(a, b) {
			return a.order - b.order;
		});
	
		// Remove optional
		var taskItemsWR = self._currTask.items.filter(function(obj) {
			return obj.order != 0;
		});
		var taskItems = JSON.parse(JSON.stringify(taskItemsWR));
		
		
		
		
		// TODO: Was trying to fix two water problem where one is optional and other is not, but that did not work
		// // Check if optional items and temove from task if no present in item list
		// for(var i = 0; i < taskItems.length; i++) {
		// 	if(taskItems[i].optional == true) {
		//
		// 		var found = false;
		//
		// 		for(var j = 0; j < itemOrder.length; j++) {
		//
		// 			// Check names
		// 			if(taskItems[i].item == self._itemArray[itemOrder[j]].name) {
		// 				found = true;
		// 				break;
		// 			}
		//
		// 			// Check category
		// 			var itemCategories = self._itemArray[itemOrder[j]].categories;
		// 			for(var k = 0; k < itemCategories.length; k++) {
		// 				if(taskItems[i].category == itemCategories[k]) {
		//
		// 					found = true;
		// 					break;
		// 				}
		// 			}
		// 		}
		//
		// 		if(found != true) {
		// 			taskItems.splice(i, 1);
		// 		}
		// 	}
		// }
		//
		
		
		
	
		// Check items with names
		for(var i = 0; i < taskItems.length; i++) {
			// Check items with name
			if(taskItems[i].item != "") {
				// Find where is the item
				for(var j = 0; j < itemOrder.length; j++) {
				
					if(taskItems[i].item == self._itemArray[itemOrder[j]].name) {
						itemOrderStatus[j] = taskItems[i].order;
					}
				}
			}
		}
	
		// Check items with category
		for(var i = 0; i < taskItems.length; i++) {
			// Check items with category
			if(taskItems[i].item == "") {
				// Find where is the item
				for(var j = 0; j < itemOrder.length; j++) {
					// Consider only if empty
					if(itemOrderStatus[j] == 0 && taskItems[i].order != -1) {
					
						var itemCategories = self._itemArray[itemOrder[j]].categories;
						for(var k = 0; k < itemCategories.length; k++) {
							if(taskItems[i].category == itemCategories[k]) {
							
								itemOrderStatus[j] = taskItems[i].order;
								taskItems[i].order = -1;
								break;
							}
						}
					
					}
				}
			}
		}
	
		// console.log(itemOrderStatus);

		// Check if correct
		var currOrder = 0;
		for(var i = 0; i < itemOrderStatus.length; i++) {
			if(itemOrderStatus[i] == 0) {
				continue;
			}
		
			if((itemOrderStatus[i] - currOrder) > 1 || (itemOrderStatus[i] - currOrder) < 0) {
				return false;
			}
			else {
				currOrder = itemOrderStatus[i];
			}
		}

		return true;
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
					// If % current level OR level is 0 as there are no lower levels
					// Make sure that difficulty is not more than 3
					var levelDifficulty = GameObj.level.level;
					if(levelDifficulty > 3) {
						levelDifficulty = 3;
					}
					
					if(rndNum > self.OLDER_TASK_PROBABILITY || levelDifficulty == 0) {
						levelTasks = self._taskArray.filter(function (obj) {
							return obj.difficulty === levelDifficulty;
						});
					}
					else {
						// If % then old ones...
						levelTasks = self._taskArray.filter(function (obj) {
							return (obj.difficulty <= levelDifficulty);
						});
					}
								
				
					// TODO: Make sure that selected task is not the same as previous
					// Try to do it 20 times if do not manage... continue with same task (maybe there is just one task)
					// Check if there was any previous
					var selectionFailed = true;
					
					if(self._currTask != null) {
												
						for(var i = 0; i < 20; i++) {
					
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
									// TODO: Make sure this is correct!
									//self._currTask = levelTasks[rndTask];
									break;
								}
							}
						}
						
						// TODO: This is a hack! Selection failed...
						if(selectionFailed == true) {
							// Pick a task the old way
							for(var i = 0; i < 20; i++) {
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
				
				// TODO: [LISA] Force a task. Uncoment these three lines below and comment the one below text "Save task in game object"
				//var task = res.rows.item(0);
				//task.task = 329;
				//GameObj.task = task;
				
				// Save task in game object
				//GameObj.task = res.rows.item(0);
				
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
			if(GameObj.level.cleared >= this.LEVEL_UP_LIMIT) {
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
			if(GameObj.level.cleared_total == this.OPEN_ROOM_LIMIT && GameObj.user.level <= this._room.level) {
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
					if(GameObj.level.level > 0) {
						GameObj.level.level--;
						GameObj.db.decLevel(GameObj.level.id);
					}
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
			
				// This is new... try 200 times to get a new present
				for(var i = 0; i < 200; i++) {
					rndNum = self.rnd.integerInRange(0, self._rocketItemArray.length-1);
					if(rocketItems.indexOf(rndNum) > -1) {
						continue;
					}
					else {
						break;
					}
				}

				// If 25 minutes have passed -> give a present
				if(Date.now() - res.rows.item(0).timestamp > (1000 * 60 * 25)) {
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