/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
		
		// 	    var deferred = $.Deferred();
		// var timeOut = 0;
		//
		//
		// //set a 1sec timeOut when App was send to suspendMode. SomeTimes PhoneGap needs it's time...
		// if (!window.device){
		// 	console.log("PhoneGap seems not to be ready yet!!!")
		// 	timeOut = 1000;
		// }
		//
		// setTimeout(function() {
		// 	deferred.resolve();
		// }, timeOut);

		
		
		// Fast click
		// if ('addEventListener' in document) {
		// 	document.addEventListener('DOMContentLoaded', function() {
		// 		FastClick.attach(document.body);
		// 	}, false);
		// }
		//
		// var w = window.innerWidth * window.devicePixelRatio;
		// 		var h = window.innerHeight * window.devicePixelRatio;
		// 		var game = new Phaser.Game(w, h, Phaser.AUTO, '');

		var w = 1280;
		var h = 800;
		var game = new Phaser.Game(w, h, Phaser.CANVAS, '');
		
		// Add states
		game.state.add('Boot', GameObj.Boot);
		game.state.add('Preloader', GameObj.Preloader);
		game.state.add('Menu', GameObj.Menu);
		game.state.add('About', GameObj.About);
		game.state.add('World', GameObj.World);
		game.state.add('Room', GameObj.Room);
		game.state.add('Rocket', GameObj.Rocket);
		
		//	Now start the Boot state.
		game.state.start('Boot');
		
		
		console.log('hello!');
		
		
		// TESTING FILE
		/*var errorHandler = function (err) {
			console.log(err);
		}

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
				
				var pathToFile = fileEntry.toURL(); 
				//pathToFile = pathToFile.replace('file://',''); 
				
				// Create a FileWriter object for our FileEntry (log.txt).
				fileEntry.createWriter(function(fileWriter) {

					fileWriter.onwriteend = function(e) {
						console.log('Write completed.');
						console.log(pathToFile);
						cordova.plugins.email.open({
							app: 'gmail',
							to: 'eriza653@student.liu.se',
							attachments: pathToFile,
							subject: 'PlaneraMera - DB',
							isHtml: false
						}, function () {
							console.log('email view dismissed');
						}); 
					};

					fileWriter.onerror = function(e) {
						console.log('Write failed: ' + e.toString());
					};

					// Create a new Blob and write it to log.txt.
					var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});

					fileWriter.write(blob);

				}, errorHandler);
			}, errorHandler);
		}, errorHandler);*/
		
		
		//return deferred.promise();
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		// var parentElement = document.getElementById(id);
		//         var listeningElement = parentElement.querySelector('.listening');
		//         var receivedElement = parentElement.querySelector('.received');
		//
		//         listeningElement.setAttribute('style', 'display:none;');
		//         receivedElement.setAttribute('style', 'display:block;');

		console.log('Received Event: ' + id);
	}
};

app.initialize();