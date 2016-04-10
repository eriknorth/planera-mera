Sound = function (game) {

	this.game = game;
	
	this.playing = false;
	
	//This is run using a timer event every second
	this.game.time.events.loop(1000, this.checkAudioContext, this);
};

Sound.prototype = {

	play: function(audioName, callback) {
		
		var self = this;
		
		if(self.playing == false)
		{
			self.playing = true;
		
			// Destory timer
			var killer = this.game.time.create();
			var audio = this.game.add.audio(audioName);
		
			audio.play();
			audio.onStop.addOnce(function() {
				// Destroy audio
				killer.add(1, function() {
					audio.destroy();
				}, this);
				killer.start();
			
				self.playing = false;
		
				// Execute callback if defined
				typeof callback === 'function' && callback();
			}, this);
		
		}
		else {
			typeof callback === 'function' && callback();
		}
	
	},
	

	playSequence: function(sequence, callback, delayStartCallback, delayEndCallback) {
		
		var self = this;
		
		if(self.playing == false)
		{
			self.playing = true;
			
			// Destory timer
			var killer = this.game.time.create();
		
			// Process array - create audios and timers
			var seqArray = [];
			for(var i = 0; i < sequence.length; i++) {
				var obj = {};
				// If name of the audio file
				if(typeof sequence[i] === 'string') {
					obj.type = 'audio';
					obj.audio = this.game.add.audio(sequence[i]);
				}
				// If delay
				else if(typeof sequence[i] === 'number') {
					obj.type = 'delay';
					obj.timer = this.game.time.create();
					obj.delay = sequence[i];
				}
				else {
					// What is this?
				}
				// Push object into array
				seqArray.push(obj);
			}		
		
		
			// Start to play first audio
			if(seqArray[0].type === 'audio') {
				seqArray[0].audio.play();
			}
			// Add sequance events
			seqArray.forEach(function(element, index, array) {
			
				// Check if next exists
				if(typeof seqArray[index + 1] !== 'undefined')
				{
			
					// Check if it is delay
					if (seqArray[index].type === 'delay') {	
						// Add delay complete event
						seqArray[index].timer.add(seqArray[index].delay, function() {
							// Play sound
							seqArray[index + 1].audio.play();
							// Execute callback if defined
							typeof delayEndCallback === 'function' && delayEndCallback();
						}, this);
					}
					// Check if next is audio 
					else if (seqArray[index + 1].type === 'audio') {
						// Add audio complete event
						seqArray[index].audio.onStop.addOnce(function() {
							// Play sound
							seqArray[index + 1].audio.play();
						}, this);
					}
					// Check if next is delay
					else if (seqArray[index + 1].type === 'delay') {	
						// Add audio complete event
						seqArray[index].audio.onStop.addOnce(function() {
							// Start timer
							seqArray[index + 1].timer.start();
					
							// Execute callback if defined
							typeof delayStartCallback === 'function' && delayStartCallback();
						}, this);
					}
				}
				// Last...
				else {
					seqArray[index].audio.onStop.addOnce(function() {
						// Destroy everything
						killer.add(1, function() {
							for(var i = 0; i < seqArray.length; i++) {
								if(seqArray[i].type === 'audio') {
									seqArray[i].audio.destroy();
								}
							}
						}, this);
						killer.start();
						
						self.playing = false;
					
						// Execute callback if defined
						typeof callback === 'function' && callback();
					}, this);
				}
			});
		}
		else {
			typeof callback === 'function' && callback();
		}
	},
	
	
	

	checkAudioContext: function (){

	    //work out when the audio context has stopped

	    if(this.game.sound.context.currentTime-this.last_context_time===0){

	        //close out the existing context and create a new one
	        //you will also need new gain nodes if you are using them

	        this.game.sound.context.close();  
	        this.game.sound.context=new AudioContext(); 
	        this.game.sound.masterGain= this.game.sound.context.createGain(); 
	        this.game.sound.masterGain.gain.volume=this.volume;
	        this.game.sound.masterGain.connect(this.game.sound.context.destination);

	        //now go through every sound and connect them to the new context
	        //creating gain nodes as we go.
	        for(var key in this.tracks){

	            var snd=this.tracks[key].snd;
	            snd.context=this.game.sound.context;
	            snd.masterGainNode = this.game.sound.masterGain;
	            snd.gainNode=this.game.sound.context.createGain();          
	            snd.gainNode.gain.value = snd.volume * this.volume;
	            snd.gainNode.connect(snd.masterGainNode);
	        }       

	    } 
		else {
	    	//update out time variable
	    	this.last_context_time = this.game.sound.context.currentTime;
	    }
	}

}