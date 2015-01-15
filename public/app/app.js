var socket = io.connect('http://localhost:8888/');
var details = {
	name: '',
	age: ''
};
var currentGrid = [];
socket.on('welcomeMsg', function (data) {
	console.log(data);
	socket.emit('privateMsg', { msg: 'I have connected', from: 'The Client' });
});
var grid = document.getElementById('grid');

socket.on('currentUsers', function(users){	
	console.log("current users are: ", users);
	document.getElementById('currentUsers').innerHTML = '';
	users.forEach(function(u){
		var user = document.createElement('li');
		user.textContent = u.name;
		document.getElementById('currentUsers').appendChild(user);
	});
});

function showNext(){
	if(document.getElementById('name').value){
		details.name = document.getElementById('name').value;
		document.getElementById('name').hidden = true;
		document.getElementById('txt').textContent = "How old are you?";
		document.getElementById('age').hidden = false;
	}
};
function showDetails(){
	details.age = document.getElementById('age').value;
	document.getElementById('age').hidden = true;
	document.getElementById('yourName').textContent = details.name;
	document.getElementById('yourAge').textContent = details.age;
	document.getElementById('details').hidden = false;
};
function yes(){
	socket.emit('person', details);
};

socket.on('login', function(user){
	console.log(user);
});
socket.on('error', function(err){
	console.log(err);
});

socket.on('updateGame', function(grid){
	console.log(grid);
	currentGrid = grid;
	drawGrid();
});

var drawGrid = function (){
	grid.innerHTML = "";
	for (var i = 0; i < currentGrid.length; i++) {
		var b = document.createElement('div');
		b.id = currentGrid[i].id;
		b.className = "box";		
		b.onclick = function(){
			toggleBox(this.id);
		};
		if(currentGrid[i].on){
			b.className = "box on";
		}
		grid.appendChild(b);
	};
};
var toggleBox = function(id){
	socket.emit('clicked', id);
};