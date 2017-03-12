var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("static"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/static/index.html");
});

var distance = function(a, b) {
	return Math.sqrt(Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2) + Math.pow((a[2] - b[2]), 2));
}

var applyEuler = function(v, e) {
	return applyQuaternion(v, eulerToQuaternion(e));
};

var eulerToQuaternion = function(e) {
	var c1 = Math.cos(e[0] / 2);
	var c2 = Math.cos(e[1] / 2);
	var c3 = Math.cos(e[2] / 2);
	var s1 = Math.sin(e[0] / 2);
	var s2 = Math.sin(e[1] / 2);
	var s3 = Math.sin(e[2] / 2);

	return [s1 * c2 * c3 + c1 * s2 * s3,
		c1 * s2 * c3 - s1 * c2 * s3,
		c1 * c2 * s3 + s1 * s2 * c3,
		c1 * c2 * c3 - s1 * s2 * s3
	];
};

var applyQuaternion = function(v, q) {
	var [x, y, z] = v;
	var [qx, qy, qz, qw] = q;

	// calculate quat * vector
	var ix = qw * x + qy * z - qz * y;
	var iy = qw * y + qz * x - qx * z;
	var iz = qw * z + qx * y - qy * x;
	var iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	return [ix * qw + iw * -qx + iy * -qz - iz * -qy,
		iy * qw + iw * -qy + iz * -qx - ix * -qz,
		iz * qw + iw * -qz + ix * -qy - iy * -qx
	];
};

var addVectors = function(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

var subVectors = function(v1, v2) {
	return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

var multVector = function(v1, s) {
	return [v1[0] * s, v1[1] * s, v1[2] * s];
}

var room = io.of('/');

var pickSpawn = function() {
	var u = Math.random();
	var v = Math.random();
	var theta = 2 * Math.PI * u;
	var phi = Math.acos(2 * v - 1);
	var radius = 500;
	var x = (radius * Math.sin(phi) * Math.cos(theta));
	var y = (radius * Math.sin(phi) * Math.sin(theta));
	var z = (radius * Math.cos(phi));
	return [
		[x, y, z],
		[0, 0, 0]
	];
};

var clients = {};
var projectiles = [];
var interval = false;

function checkCollision(ship, laser) {
	var xyzbounds = [5, 5, 5];
	if (distance(laser.pos, ship.pos) <= 50 + 10) { // 10 is arbitrary, supposed to be half the diagonal of the ship
		//check collisions here
		console.log("possible hit" + Math.random());
		var laserstart = applyEuler(subVectors(laser.pos, laser.vel), ship.rot),
			laserend = applyEuler(addVectors(laser.pos, laser.vel), ship.rot);
		//change bounds to fit the ship more

		if (Math.min(laserstart[2], laserend[2]) < ship.pos[2] + xyzbounds[2] && Math.max(laserstart[2], laserend[2]) > ship.pos[2] + xyzbounds[2]) {
			var intersect = addVectors(multVector(subVectors(laserend, laserstart), (ship.pos[2] + xyzbounds[2] - laserstart[2]) / (laserend[2] - laserstart[2])), laserstart);
			if (Math.abs(intersect[0] - ship.pos[0]) < xyzbounds[0] && Math.abs(intersect[1] - ship.pos[1]) < xyzbounds[1]) {
				return true;
			}
		}

		//repeat for the other 5 planes

		//return true; //for testing
	}
	return false;
}

function update() {
	// for (var id in ships) {
	// 	if (ships.hasOwnProperty(id)) {
	// 		ships[id].update();
	// 	}
	// }
	for (var i = 0; i < projectiles.length; i++) {
		let laser = projectiles[i];
		laser.life--;
		laser.pos = addVectors(laser.pos, laser.vel);
		//check for hits
		for (var j in clients) {
			if (j != laser.source && checkCollision(clients[j], laser)) {
				console.log('Hit Legit.');
				room.emit('hit', { source: laser.source, hit: j });
				clients[j].deaths++;
				clients[laser.source].kills++;
			}
		}
	}
	projectiles = projectiles.filter((o) => {
		return o.life >= 0;
	});
}

room.on("connection", function(socket) {
	console.log(socket.client.id + " joined");
	var [startpos, startrot] = pickSpawn();
	var startvel = [1, 0, 0];
	var startobj = {
		pos: startpos,
		vel: startvel,
		rot: startrot,
		kills: 0,
		deaths: 0,
		shots: 0
	};
	socket.emit('init', { pos: startpos, vel: startvel, rot: startrot });
	for (var id in clients) {
		if (clients.hasOwnProperty(id)) {
			socket.emit('join', { id: id, ship: clients[id] });
		}
	}
	clients[socket.client.id] = startobj;
	socket.broadcast.emit('join', { id: socket.client.id, ship: startobj });
	if (!interval)
		interval = setInterval(update, 17);

	socket.on('disconnect', function(data) {
		console.log(socket.client.id + " left");
		delete clients[socket.client.id];
		socket.broadcast.emit('leave', socket.client.id);
		if (Object.keys(clients).length === 0) {
			clearInterval(interval);
			interval = false;
		}
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
		ship.shots++;
		projectiles.push({ pos: ship.pos.slice(), vel: applyEuler([50, 0, 0], ship.rot), source: data.id, life: 100 });

		socket.broadcast.emit('laser', data);
	});

	socket.on('retrieve data', function(data) {
		var client = clients[socket.client.id];
		socket.emit('retrieve data', { k: client.kills, d: client.deaths, s: client.shots });
	});

	socket.on('respawn', function(data) {
		var client = clients[socket.client.id];
		client.pos, client.rot = pickSpawn();
		socket.emit('respawn', { pos: client.pos, rot: client.rot });
	});
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log(`Running on port ${port}...`);
});
