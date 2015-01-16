var express = require('express.io'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	app = express(),
	port = process.env.PORT || 8888;

var db = [{
	name: 'Jake',
	age: 29,
	info: 'This should be private'
},{
	name: 'Jim',
	age: 18,
	info: 'This should be private'
}];
// var currentGrid = [];
// var grid = [{
// 	id: 0,
// 	on: false,
// 	neighbors: [1,4]
// },{
// 	id: 1,
// 	on: false,
// 	neighbors: [0,2,5]
// },{
// 	id: 2,
// 	on: false,
// 	neighbors: [1,3,6]
// },{
// 	id: 3,
// 	on: false,
// 	neighbors: [2,7]
// },{
// 	id: 4,
// 	on: false,
// 	neighbors: [0,5,8]
// },{
// 	id: 5,
// 	on: false,
// 	neighbors: [4,1,6,9]
// },{
// 	id: 6,
// 	on: false,
// 	neighbors: [5,2,7,10]
// },{
// 	id: 7,
// 	on: false,
// 	neighbors: [6,3,11]
// },{
// 	id: 8,
// 	on: false,
// 	neighbors: [4,9]
// },{
// 	id: 9,
// 	on: false,
// 	neighbors: [8,5,10]
// },{
// 	id: 10,
// 	on: false,
// 	neighbors: [9,6,11]
// },{
// 	id: 11,
// 	on: false,
// 	neighbors: [10,7]
// }];
var grid = [];
var currentGrid = [];


//0,0 bottom left
var rows = 8;
var cols = 8;
for(var x=0; x<rows; x++){	
	for(var y=0; y<cols; y++){
		var id = x + ',' + y;
		var box = {
			id: id,
			x: x,
			y: y,
			neighbors: [],
			on: false
		};
		if(box.x < rows){
			//top neighbor
			box.neighbors.push({x: x+1, y: y});
		}
		if(box.y < cols){
			//right neighbor
			box.neighbors.push({x: x, y: y+1});
		}
		if(box.x > 0){
			//bottom neighbor
			box.neighbors.push({x: x-1, y: y});
		}
		if(box.y > 0){
			//left neighbor
			box.neighbors.push({x: x, y: y-1});
		}		
		grid.unshift(box);
		console.log(box);
	};	
};

// test.forEach(function(box, i){
// 	if(i>0 || i<rows){
// 		//Top neighbor should exist
// 	}
// 	if(i)
// });
// for(var r=0; r<rows*cols; r++){
// 	for(var c=0; c<cols; c++){
// 		if(r>0){
// 			test[r].neighbors.push({x: r-1, y:c});
// 		}
// 		if (r < rows - 1) { // has south
// 	     test[r].neighbors.push({x: r+1, y:c});
// 	    }
// 	    if (c > 0) {     // has west
// 	      test[r].neighbors.push({x: r, y:c-1});
// 	    }
// 	    if (c < cols - 1) { // has east
// 	      test[r].neighbors.push({x: r-1, y:c+1});
// 	    }
// 	};
// };

var updateGame = function(){	
	app.io.sockets.emit('updateGame', currentGrid);
};

var reset = function(){
	currentGrid = [];
	grid.forEach(function(box){
		currentGrid.push(box);	
	});
	updateGame();	
};

var currentUsers = [];

var io = app.http().io();

app.use(session({
	secret: 'Shh, its a secret to everybody!',
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: true,
		maxAge: new Date(Date.now() + 3600000)
	}
}));
app.use(express.static(__dirname + '/public'));

reset();

app.io.on('connection', function(socket){
updateGame();

var updateUsers = function(user){
	var found = false;
	currentUsers.forEach(function(u, i){
		if(u.name === user.name){
			found = true;
			currentUsers.splice(i, 1);
		}
	});
	if(!found){		
		currentUsers.push(user);
	}	
	app.io.sockets.emit('currentUsers', currentUsers);
};

	socket.emit('welcomeMsg', {welcomeMsg: 'Hello welcome to your socket connection', socket: socket.id});
	socket.emit('currentUsers', currentUsers);
	// app.io.route('privateMsg', function(req){
	// 	console.log(req.data.from, req.data.msg);
	// });

app.io.route('person', function(req){
	var user = '';
	db.forEach(function(person){		
		if(req.data.name === person.name && req.data.age == person.age){	
			user = person;
			updateUsers(user);
		}
	});		
	if (user) {
		socket.emit('login', user);
	} else {
		socket.emit('error', {error: 'Your credentials were invalid'});
	};
});

app.io.route('clicked', function(req){	
	var boxId = req.data;
	var box = '';
	for (var i = 0; i < currentGrid.length; i++) {
		if(currentGrid[i].id == boxId){
			box = currentGrid[i];
		}
	};
	if(box){
		box.on = !box.on;
		for (var i = 0; i < box.neighbors.length; i++) {
			var neighborId = box.neighbors[i].x +','+ box.neighbors[i].y;
			for (var j = 0; j < currentGrid.length; j++) {
				if(currentGrid[j].id == neighborId){
					currentGrid[j].on = !currentGrid[j].on;
				}
			};				
		};
	}
	updateGame();	
});

app.io.route('reset', function(req){
	reset();
});

socket.on('disconnect', function(){
	console.log("A USER DISCONNECTED");
})
});

app.listen(port, function(){
	console.log("Listening on port:" + port);
});