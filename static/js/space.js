var scene = new THREE.Scene();
var skyboxScene = new THREE.Scene();
var camera;
var skyboxCamera;
var skybox;

var keys = Array(256).fill(false);

var AXES = false;
var CUBE = true;
var morecubes = true;

var updateCounter = 0;

var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = 'canvas3';
document.body.appendChild(renderer.domElement);

function segmentBoxCollision(s, b) {
	var [p1, p2] = s;
	var [b1, b2] = b;
	
}

var targetdx = 0;
var targetdy = 0;

var dx = 0;
var dy = 0;

function updatePosition(e) {
	dx = e.movementX / 500;
	dy = e.movementY / 500;
}

function checkKeys() {
	if (keys[32]) {
		fire(player.model.position, player.model.rotation);
		sendLaser();
	}
	if (keys[87]) {
		player.vel.x = Math.min(2.5, player.vel.x + 0.02);
		sendVelocityUpdate();
	}
	if (keys[83]) {
		player.vel.x = Math.max(0, player.vel.x - 0.02);
		sendVelocityUpdate();
	}
}

var touch = false;

function copyTouch(touch) {
	return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

document.addEventListener('touchstart', function(e) {
	e.preventDefault();
	if (!touch) {
		touch = copyTouch(e.changedTouches[0]);
		touch.moved = false;
	}
}, false);

document.addEventListener('touchmove', function(e) {
	e.preventDefault();
	var touches = e.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		var t = touches.item(i);
		if (t.identifier == touch.identifier) {
			dx = (t.pageX - touch.pageX) / 1000;
			dy = (t.pageY - touch.pageY) / 1000;
			touch = copyTouch(t);
			touch.moved = true;
			break;
		}
	}
}, false);

document.addEventListener('touchend', function(e) {
	var touches = e.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		var t = touches.item(i);
		if (t.identifier == touch.identifier) {
			if (!touch.moved && t.pageX == touch.pageX && t.pageY == touch.pageY) {
				fire(player.model.position, player.model.rotation);
				sendLaser();
			}
			touch = false;
			break;
		}
	}
}, false);

var canvas = renderer.domElement;
canvas.requestPointerLock = canvas.requestPointerLock ||
	canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
	document.mozExitPointerLock;

canvas.onclick = function() {
	canvas.requestPointerLock();
};
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('keydown', keyDown, false);
document.addEventListener('keyup', keyUp, false);

function lockChangeAlert() {
	if (document.pointerLockElement === canvas ||
		document.mozPointerLockElement === canvas) {
		document.addEventListener("mousemove", updatePosition, false);
	} else {
		document.removeEventListener("mousemove", updatePosition, false);
	}
}

var ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);
var light = new THREE.DirectionalLight(0xffffff);
scene.add(light);

var loader = new THREE.JSONLoader();
var player;

var ships = {};
var lasers = [];
var lastfiretime = 0;
var time = new Date().getTime();
var oldtime = new Date().getTime();
var dt = 0;
var newShip = function(pos, vel, rot, avel) {
	var ship = new Ship(pos, vel, rot, avel);
	ships.push(ship);
	return ship;
};

var update = function() {
	for (var id in ships) {
		if (ships.hasOwnProperty(id)) {
			ships[id].update();
		}
	}
	for (var i = 0; i < lasers.length; i++) {
		if (lasers[i].update()) {
			delete lasers[i];
		}
	}
	lasers = lasers.filter((i) => {
		return i;
	})

	targetdx += dx;
	targetdy += dy;

	player.model.rotateY(-targetdx / 1.2);
	player.model.rotateZ(-targetdy / 1.2);
	targetdx /= 1.2;
	targetdy /= 1.2;
	dx = dy = 0;
	sendPositionUpdate();
	checkKeys();
};

function keyDown(event) {
	keys[event.keyCode] = true;
}

function keyUp(event) {
	keys[event.keyCode] = false;
}

var fire = function(position, rotation) {
	if (time > lastfiretime + 250) {
		var laserBurst = new LaserBurst(position, rotation);
		lasers.push(laserBurst);
		lastfiretime = time;
		return laserBurst;
	}
	return;
};

var drawUI = function() {
	var ctx = document.getElementById('ui').getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = '#FFF';
	ctx.font = '15px sans-serif';
	ctx.fillText(`Speed: ${(player.vel.x * 60).toFixed(2)}`, 5, 25);
	ctx.fillText(`x: ${(player.model.position.x).toFixed(2)}`, 5, 45);
	ctx.fillText(`y: ${(player.model.position.y).toFixed(2)}`, 5, 65);
	ctx.fillText(`z: ${(player.model.position.z).toFixed(2)}`, 5, 85);
};

var render = function() {
	requestAnimationFrame(render);

	oldtime = time;
	time = new Date().getTime();
	dt = time - oldtime;
	var r = camera.getWorldRotation();
	skyboxCamera.rotation.x = r.x;
	skyboxCamera.rotation.y = r.y;
	skyboxCamera.rotation.z = r.z;

	renderer.clear();
	renderer.render(skyboxScene, skyboxCamera);
	renderer.clearDepth();
	renderer.render(scene, camera);
	drawUI();
	update();
};

var init = function(startpos, startvel, startrot) {
	console.log(startpos, startvel, startrot);
	startpos = startpos || new Vector3(-1000, 0, 0);
	startvel = startvel || new Vector3(1, 0, 0);
	startrot = startrot || new Vector3(0, 0, 0);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

	skyboxCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
	var materials = Array(6).fill(new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("img/skybox.png"),
		side: THREE.BackSide
	}));
	var skyMaterial = new THREE.MultiMaterial(materials);
	var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	skyboxScene.add(skyBox);

	var geometry = new THREE.BoxGeometry(200, 200, 200);
	for (var i = 0; i < geometry.faces.length; i++) {
		geometry.faces[i].color.setHex(Math.random() * 0xffffff);
	}

	if (CUBE) {
		var material = new THREE.MeshPhongMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
		var cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
		if (morecubes) {
			var cube2 = cube.clone();
			var cube3 = cube.clone();
			var cube4 = cube.clone();
			var cube5 = cube.clone();
			var cube6 = cube.clone();
			var cube7 = cube.clone();
			cube2.position.x = 1500;
			scene.add(cube2);
			cube3.position.x = -1500;
			scene.add(cube3);
			cube4.position.y = 1500;
			scene.add(cube4);
			cube5.position.y = -1500;
			scene.add(cube5);
			cube6.position.z = 1500;
			scene.add(cube6);
			cube7.position.z = -1500;
			scene.add(cube7);
		}
		cube.rotation.x = Math.PI / 4;
		cube.rotation.y = Math.PI / 4;
		cube.rotation.z = Math.PI / 4;
	}

	if (AXES) {
		var axisHelper = new THREE.AxisHelper(20000);
		scene.add(axisHelper);
	}

	camera.position.set(-15, 4, 0);
	camera.rotation.set(0, -Math.PI / 2, 0);
	player = new Ship(startpos, startvel, startrot, new Vector3(0, 0, 0));
	player.addCamera(camera);
	ships[socket.id] = player;
	THREEx.WindowResize(renderer, camera);
	render();
};

$(window).on("resize", function() {
	$("#ui").attr("width", $(window).width())
		.attr("height", $(window).height());
});
$("#ui").attr("width", $(window).width())
	.attr("height", $(window).height());

var sendPositionUpdate = function() {
	socket.emit('move', { pos: player.model.position.toArray(), rot: player.model.rotation.toArray().slice(0, 3) });
};

var sendVelocityUpdate = function() {
	socket.emit('velchange', { vel: player.vel.toArray() });
};

var sendLaser = function() {
	socket.emit('laser', 0);
};

var socket;

loader.load("assets/ship.json", function(geometry, materials) {
	Ship.geometry = geometry;
	Ship.materials = new THREE.MeshStandardMaterial();
	//Ship.materials = new THREE.MultiMaterial(materials); // very slow
	socket = io.connect('/');
	socket.on('connect', function() {
		socket.on('init', function(data) {
			init(new Vector3(...data.pos), new Vector3(...data.vel), new Vector3(...data.rot));
		});
		socket.on('join', function(data) {
			console.log(data.id + " joined");
			var ship = new Ship(new Vector3(...data.ship.pos), new Vector3(...data.ship.vel), new Vector3(...data.ship.rot), new Vector3(0, 0, 0));
			ships[data.id] = ship;
		});

		socket.on('leave', function(data) {
			console.log(data + " left");
			scene.remove(ships[data].model);
			delete ships[data];
		});

		socket.on('move', function(data) {
			var ship = ships[data.id];
			if (!ship) return;
			[ship.model.position.x, ship.model.position.y, ship.model.position.z] = data.pos;
			[ship.model.rotation.x, ship.model.rotation.y, ship.model.rotation.z] = data.rot;
		});

		socket.on('velchange', function(data) {
			var ship = ships[data.id];
			if (!ship) return;
			ship.vel = data.vel;
		});

		socket.on('laser', function(data) {
			fire(ships[data.id].model.position, ships[data.id].model.rotation);
		});
	});
});