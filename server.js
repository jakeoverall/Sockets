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
}];

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

	socket.emit('welcomeMsg', {welcomeMsg: 'Hello welcome to your socket connection', socket: socket.id});

	app.io.route('privateMsg', function(req){
		console.log(req.data.from, req.data.msg);
	});

app.io.route('person', function(req){
	var user = '';
	db.forEach(function(person){		
		if(req.data.name === person.name && req.data.age == person.age){
			console.log('Found');
			user = person;
		}
	});	
	console.log(user, 'The User');
	if (user) {
		socket.emit('login', user);
	} else {
		socket.emit('error', {error: 'Your credentials were invalid'});
	};
	});
});

app.listen(port, function(){
	console.log("Listening on port:" + port);
});