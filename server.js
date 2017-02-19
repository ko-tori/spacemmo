var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("static"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/static/index.html");
});

var room = io.of('/');

var pickSpawn = function() {
	return [-100, 0, 0];
}

var clients = {};
var projectiles = [];
var interval = false;

function update() {

}

room.on("connection", function(socket) {
	var startpos = pickSpawn();
	var startrot = [0, 0, 0];
	var startvel = [1, 0, 0];
	var startobj = {pos: startpos, vel: startvel, rot: startrot};
	socket.emit('init', { pos: startpos });
	for (var id in clients) {
		if (clients.hasOwnProperty(id)) {
			socket.emit('join', { id: id, ship: clients[id]});
		}
	}
	clients[socket.client.id] = startobj;
	socket.broadcast.emit('join', { id: socket.client.id, ship: startobj });
	if (!interval)
		interval = setInterval(update, 17);

	socket.on('disconnect', function(data) {
		delete clients[socket.client.id];
		socket.broadcast.emit('leave', socket.client.id);
		if (Object.keys(clients).length === 0)
			clearInterval(interval);
	});

	socket.on('move', function(data) {
		data.id = socket.client.id;
		var ship = clients[data.id];
		ship.pos = data.pos;
		ship.rot = data.rot;
		socket.broadcast.emit('move', data);
	});

	socket.on('velchange', function(data) {
		data.id = socket.client.id;
		var ship = clients[data.id];
		ship.vel = data.vel;
		socket.broadcast.emit('velchange', data);
	});

	socket.on('laser', function(data) {
		data = { id: socket.client.id };
		var ship = clients[data.id];
		socket.broadcast.emit('laser', data);
	});
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log(`Running on port ${port}...`);
});
