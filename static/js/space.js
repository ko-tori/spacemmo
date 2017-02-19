var scene = new THREE.Scene();
var skyboxScene = new THREE.Scene();
var camera;
var skyboxCamera;
var skybox;

var updateCounter = 0;

var renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var dx = 0;
var dy = 0;

function updatePosition(e) {
	dx = e.movementX / 100;
	dy = e.movementY / 100;
}

var canvas = document.querySelector('canvas');
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

function lockChangeAlert() {
	if (document.pointerLockElement === canvas ||
		document.mozPointerLockElement === canvas) {
		console.log('The pointer lock status is now locked');
		document.addEventListener("mousemove", updatePosition, false);
	} else {
		console.log('The pointer lock status is now unlocked');
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
var time;
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
	for(var i = 0; i < lasers.length;i++){
		if(lasers[i].update()){
			delete lasers[i];
		}
	}
	lasers = lasers.filter((i) => {return i;})

	player.model.rotateY(-dx);
	player.model.rotateZ(-dy);
	dx = dy = 0;
	sendPositionUpdate();
};

function keyDown(event) {
	if (event.keyCode == 32) {
		fire(player.model.position, player.model.rotation);
	}
	if (event.keyCode == 87) {
		if(player.vel.x<2){
			player.vel.x+=.02;
		}
	}
	if (event.keyCode == 83) {
		if(player.vel.x>0.02){
			player.vel.x-=.02;
		}
	}
}

var fire = function(position, rotation){
	if(time>lastfiretime + 250)
	{
		var laserBurst = new LaserBurst(position, rotation);
		lasers.push(laserBurst);
		lastfiretime = time;
		return laserBurst;
	}
	return;
};

var render = function() {
	update();
	requestAnimationFrame(render);
	time = new Date().getTime();

	var r = camera.getWorldRotation();
	skyboxCamera.rotation.x = r.x;
	skyboxCamera.rotation.y = r.y;
	skyboxCamera.rotation.z = r.z;

	renderer.clear();
	renderer.render(skyboxScene, skyboxCamera);
	renderer.clearDepth();
	renderer.render(scene, camera);
};

var init = function(startpos, startrot) {
	startpos = startpos || new Vector3(-100, 0, 0);
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

	var geometry = new THREE.BoxGeometry(20, 20, 20);
	for (var i = 0; i < geometry.faces.length; i++) {
		geometry.faces[i].color.setHex(Math.random() * 0xffffff);
	}

	var material = new THREE.MeshPhongMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
	var cube = new THREE.Mesh(geometry, material);
	cube.rotation.x = Math.PI / 4;
	cube.rotation.y = Math.PI / 4;
	cube.rotation.z = Math.PI / 4;
	scene.add(cube);

	camera.position.set(-15, 4, 0);
	camera.rotation.set(0, -Math.PI / 2, 0);
	player = new Ship(startpos, new Vector3(1, 0, 0), startrot, new Vector3(0, 0, 0));
	player.addCamera(camera);
	ships[socket.id] = player;

	render();
}

var sendPositionUpdate = function() {
	socket.emit('move', { pos: player.model.position.toArray(), rot: player.model.rotation.toArray().slice(0, 3) });
};

var socket;

loader.load("assets/ship.json", function(geometry, materials) {
	Ship.geometry = geometry;
	Ship.materials = new THREE.MeshStandardMaterial();//new THREE.MultiMaterial(materials);
	socket = io.connect('/');
	socket.on('connect', function() {
		socket.on('init', function(data) {
			var [x, y, z] = data.pos;
			init(new Vector3(x, y, z));
		});
		socket.on('join', function(data) {
			console.log("Joined: ", data.pos);
			var [x, y, z] = data.pos;
			var [a, b, c] = data.rot;
			var ship = new Ship(new Vector3(x, y, z), new Vector3(1, 0, 0), new Vector3(a, b, c), new Vector3(0, 0, 0));
			ships[data.id] = ship;
		});

		socket.on('leave', function(data) {
			console.log(data.id + "left");
			scene.remove(ships[data.id].model);
			delete ships[data.id];
		});

		socket.on('move', function(data) {
			console.log(data);
			var ship = ships[data.id];
			if (!ship) return;
			[ship.model.position.x, ship.model.position.y, ship.model.position.z] = data.pos;
			[ship.model.rotation.x, ship.model.rotation.y, ship.model.rotation.z] = data.rot;
		});
	});
});
