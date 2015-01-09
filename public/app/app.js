var socket = io.connect('http://localhost:8888/');

var details = {
	name: '',
	age: ''
};

socket.on('welcomeMsg', function (data) {
	console.log(data);
	socket.emit('privateMsg', { msg: 'I have connected', from: 'The Client' });
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