Box = function(game, y) {

	this.game = game;
	this.yPos = y;
	
	this.box = [];
	this.arrow = [];
	this.num = 0;

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
	for(i = num-1; i >= 0; i--) {
		this.box[i] = this.game.make.sprite(offset + spacing * i, this.yPos, 'box');
		this.box[i].anchor.set(0.5);
		this.add(this.box[i]);
		
		if(i > 0) {
			this.arrow[i] = this.game.make.sprite(offset + spacing * i - bWidth/2+10, this.yPos, 'arrow');
			this.arrow[i].anchor.set(1, 0.5);
			this.add(this.arrow[i]);
		}
	}
	
	// Add extra layer for items
	this.items = this.game.make.group();
	this.add(this.items);
}

// Reset Boxes
Box.prototype.resetBoxes = function() {
	
	if(this.num != 0) {
		// for(i = 0; i < this.num; i++) {
// 			this.remove(this.box[i]);
// 			if(i > 0) {
// 				this.remove(this.arrow[i]);
// 			}
// 		}
		this.removeAll();

		this.box = [];
		this.arrow = [];
		this.items = [];
		this.num = 0;
	}
}

// Check overlap
Box.prototype.checkOverlap = function(item) {
		
	// Check colision
	for(i = 0; i < this.num; i++) {
		
		var b = this.box[i];
		
		if( item.x > (b.x - b.width/2) && 
			item.x < (b.x + b.width/2) &&
			item.y > (b.y - b.height/2) && 
			item.y < (b.y + b.height/2))
		{
			// If collision, set position as box
			item.x = b.x;
			item.y = b.y;
			
			// Scale to fit in
			if(item.getHeight() > 140) {
				var ratio = 140 / item.getHeight();
				item.scale.setTo(ratio);
			}
			else if(item.getWidth() > 140) {
				var ratio = 140 / item.getWidth();
				item.scale.setTo(ratio);
			}
		}
	}
	

}



