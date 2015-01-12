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

app.io.on('connection', function(socket){

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

socket.on('disconnect', function(){
	console.log("A USER DISCONNECTED");
})
});

app.listen(port, function(){
	console.log("Listening on port:" + port);
});