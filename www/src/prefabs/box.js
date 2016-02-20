Box = function(game, y) {

	this.game = game;
	this.yPos = y;
	
	this.box = [];
	this.arrow = [];
	this.num = 0;
	
	this.items = [];

    Phaser.Group.call(this, game, null);
};

Box.prototype = Object.create(Phaser.Group.prototype);
Box.prototype.constructor = Box;


// Set Boxes
Box.prototype.setBoxes = function(num) {
	
	// First reset
	this.resetBoxes();
	
	this.num = num;
	
	// Calculate spacing
	var bWidth = this.game.cache.getImage('box').width;
	var spacing = bWidth + bWidth/3;
	// Calculate offset
	var offset = (this.game.world.width - (spacing * (num-1))) / 2;
	// Generate boxes and arrows
	for(var i = num-1; i >= 0; i--) {
		this.box[i] = this.game.make.sprite(offset + spacing * i, this.yPos, 'box');
		this.box[i].anchor.set(0.5);
		this.add(this.box[i]);
		
		if(i > 0) {
			this.arrow[i] = this.game.make.sprite(offset + spacing * i - bWidth/2+10, this.yPos, 'arrow');
			this.arrow[i].anchor.set(1, 0.5);
			this.add(this.arrow[i]);
		}
		
		this.items[i] = -1;
	}
}

// Reset Boxes
Box.prototype.resetBoxes = function() {
	
	if(this.num != 0) {

		this.removeAll();

		this.box = [];
		this.arrow = [];
		this.items = [];
		this.num = 0;
	}
}

// Check overlap
Box.prototype.checkOverlap = function(item) {
	
	var overlap = false;
	var kicker = true;
	
	var lastState = this.items;
	
	// Check colision
	for(i = 0; i < this.num; i++) {
		
		var b = this.box[i];
		
		if( item.x > (b.x - b.width/2) && 
			item.x < (b.x + b.width/2) &&
			item.y > (b.y - b.height/2) && 
			item.y < (b.y + b.height/2))
		{
			// Register item in the box
			if(this.items[i] == -1) {
				this.items[i] = item;
				
				// Check if this item is in other box
				for(var j = 0; j < this.num; j++) {
					if(this.items[j] != -1 && j != i) {
						// Remove if it was in the box
						if(this.items[j].getId() == item.getId()) {
							this.items[j] = -1;
						}
					}
				}
			}
			// Someone else is in the box...
			else {
				// Check if this item is in other box
				for(var j = 0; j < this.num; j++) {
					if(this.items[j] != -1 && j != i) {
						// Exchange items in places
						if(this.items[j].getId() == item.getId()) {
							this.items[j] = this.items[i];
							this.items[i] = item;
							
							// Place other item in the other box
							this.items[j].setPos(this.box[j].x, this.box[j].y);
							
							kicker = false;
							break;
						}
					}
				}
				
				// Item was not in other box...
				// Kick out the item
				if(kicker == true) {
					
					var pos = item.getLastPos();
					this.items[i].setPos(pos.x, pos.y);
					
					this.items[i] = item;
					
				}
				else {
					// Reset kicker
					kicker = true;
				}
			}
			
			
			// If collision, set position as box
			item.setPos(b.x, b.y);
			
			// Scale to fit in
			if(item.getHeight() > 140) {
				var ratio = 140 / item.getHeight();
				item.scale.setTo(ratio);
			}
			else if(item.getWidth() > 140) {
				var ratio = 140 / item.getWidth();
				item.scale.setTo(ratio);
			}
			
			// Set overlap
			overlap = true;
		}
	}
	
	// Check if box was in the box
	if(overlap == false) {
		for(i = 0; i < this.num; i++) {
			// Check if item was in the box
			if(this.items[i] != -1) {
				// Remove if it was in the box
				if(this.items[i].getId() == item.getId()) {
					this.items[i] = -1;
					console.log('I\'m was in box: ' + i);
				}
			}
		}
	}
	
	console.log(this.getOrder());
	
	return overlap;
}

Box.prototype.getOrder = function() {
	
	var order = [];
	
	// Loop through all the items
	for(var i = 0; i < this.num; i++) {
		if(this.items[i] != -1) {
			order[i] = this.items[i].getId();
		}
		else {
			order[i] = -1;
		}
	}
	
	return order;
}

