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

room.on("connection", function(socket) {
	var startpos = pickSpawn();
	var startrot = [0, 0, 0];
	socket.emit('init', { pos: startpos });
	for (var id in clients) {
		if (clients.hasOwnProperty(id)) {
			socket.emit('join', { id: id, pos: clients[id].pos, rot: clients[id].rot });
		}
	}
	clients[socket.client.id] = { pos: startpos, rot: startrot };
	socket.broadcast.emit('join', { id: socket.client.id, pos: startpos, rot: startrot });

	socket.on('disconnect', function(data) {
		delete clients[socket.client.id];
		socket.broadcast.emit('leave', socket.client.id);
	});

	socket.on('move', function(data) {
		data.id = socket.client.id;
		var ship = clients[data.id];
		ship.pos = data.pos;
		ship.rot = data.rot;
		socket.broadcast.emit('move', data);
	});
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log(`Running on port ${port}...`);
});
