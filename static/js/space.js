var scene = new THREE.Scene();
var skyboxScene = new THREE.Scene();
var camera;
var skyboxCamera;
var skybox;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var dx = 0;
var dy = 0;

function updatePosition(e) {
	dx = e.movementX / 500;
	dy = e.movementY / 500;
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
var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(10, 100, 10);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 10000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

var loader = new THREE.JSONLoader();
var player;
<<<<<<< HEAD
var ships = {};
var lasers = [];

var update = function() {
	ships.forEach((ship) => {
		ship.update();
	});
	lasers.forEach((laser) => {
		laser.update();
	});
	player.model.rotateY(-dx);
	player.model.rotateZ(-dy);
	dx = dy = 0;
	sendPositionUpdate();
};
function keyDown(event){
	if(event.keyCode == 32){
		fire(player.model.position,player.model.rotation);
	} 
}
var fire = function(position, rotation){
	var laserBurst = new LaserBurst(position, rotation);
	lasers.push(laserBurst);
	return laserBurst;
};

var render = function() {
	update();
	requestAnimationFrame(render);

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
	startpos = startpos || new Vector3(-100,0,0);
	startrot = startrot || new Vector3(0,0,0);
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

	skyboxCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);
	var materials = Array(6).fill(new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("img/skybox.png"),
		side: THREE.BackSide
	}));
	var skyMaterial = new THREE.MeshFaceMaterial(materials);
	var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	skyboxScene.add(skyBox);

	var geometry = new THREE.BoxGeometry(20, 20, 20);
	for (var i = 0; i < geometry.faces.length; i++) {
		geometry.faces[i].color.setHex(Math.random() * 0xffffff);
	}

	var material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors });
	var cube = new THREE.Mesh(geometry, material);
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

var socket = io.connect('/');
socket.on('connect', function() {
	socket.on('init', function(data) {
		var [x, y, z] = data.pos;
		loader.load("assets/ship.json", function(geometry, materials) {
			Ship.geometry = geometry;
			Ship.materials = materials;
			init(new Vector3(x, y, z));
		});
	});
	socket.on('join', function(data) {
		var [x, y, z] = data.pos;
		var [a, b, c] = data.rot;
		var ship = new Ship(new Vector3(x, y, z), new Vector3(1, 0, 0), new Vector3(a, b, c), new Vector3(0, 0, 0));
	});

	socket.on('leave', function(data) {
		scene.remove(ships[data.id].model);
		delete ships[data.id];
	});

	socket.on('move', function(data) {
		var ship = ships[data.id];
		if (!ship) return;
		[ship.position.x, ship.position.y, ship.position.z] = data.pos;
		[ship.rotation.x, ship.rotation.y, ship.rotation.z] = data.rot;
	});
});
