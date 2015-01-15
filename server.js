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
var currentGrid = [];
var grid = [{
	id: 0,
	on: false,
	neighbors: [1,4]
},{
	id: 1,
	on: false,
	neighbors: [0,2,5]
},{
	id: 2,
	on: false,
	neighbors: [1,3,6]
},{
	id: 3,
	on: false,
	neighbors: [2,7]
},{
	id: 4,
	on: false,
	neighbors: [0,5,8]
},{
	id: 5,
	on: false,
	neighbors: [4,2,6,9]
},{
	id: 6,
	on: false,
	neighbors: [5,3,7,10]
},{
	id: 7,
	on: false,
	neighbors: [6,3,11]
},{
	id: 8,
	on: false,
	neighbors: [4,9]
},{
	id: 9,
	on: false,
	neighbors: [8,5,10]
},{
	id: 10,
	on: false,
	neighbors: [9,6,11]
},{
	id: 11,
	on: false,
	neighbors: [10,7]
}];

var updateGame = function(){	
	console.log("UPDATE GAME");
	console.log(currentGrid);
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
	console.log(currentUsers);
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
			console.log('Found');
			user = person;
			updateUsers(user);
		}
	});	
	console.log(user, 'The User');
	if (user) {
		socket.emit('login', user);
	} else {
		socket.emit('error', {error: 'Your credentials were invalid'});
	};
});

app.io.route('clicked', function(req){	
	console.log(req.data);
	var boxId = req.data;
	currentGrid[boxId].on = !currentGrid[boxId].on;
	for (var i = 0; i < currentGrid[boxId].neighbors.length; i++) {
		currentGrid[currentGrid[boxId].neighbors[i]].on = !currentGrid[currentGrid[boxId].neighbors[i]].on;		
	};
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