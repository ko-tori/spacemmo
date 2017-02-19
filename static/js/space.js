var scene = new THREE.Scene();
var skyboxScene = new THREE.Scene();
var camera;
var skyboxCamera;
var skybox;



var renderer = new THREE.WebGLRenderer({alpha: true});
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
spotLight.position.set(100, 1000, 100);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 10000;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);

var loader = new THREE.JSONLoader();
loader.load("assets/ship.json", function(geometry, materials) {
	Ship.geometry = geometry;
	Ship.materials = materials;
	init();
});

var geometry = new THREE.BoxGeometry( 200, 200, 200 );
for ( var i = 0; i < geometry.faces.length; i ++ ) {
    geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
}

var material = new THREE.MeshLambertMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var player;
var ships = [];

var newShip = function(pos, vel, rot, avel) {
	var ship = new Ship(pos, vel, rot, avel);
	ships.push(ship);
	return ship;
}

var update = function() {
	ships.forEach((ship) => {
		ship.update();
	});
	player.model.rotateY(-dx);
	player.model.rotateZ(-dy);
	dx = dy = 0;
}




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

var init = function() {
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

	skyboxCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
	
	var skyGeometry = new THREE.CubeGeometry(50000,50000,50000);
	var materials = Array(6).fill(new THREE.MeshBasicMaterial(
		{
			map:THREE.ImageUtils.loadTexture("img/skybox.png"),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial(materials);
	var skyBox = new THREE.Mesh(skyGeometry,skyMaterial);
	skyboxScene.add(skyBox);


	camera.position.set(-150, 40, 0);
	camera.rotation.set(0, -Math.PI / 2, 0);
	player = newShip(new Vector3(-1000, 0, 0), new Vector3(10, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0));
	player.addCamera(camera);
	
	render();
}
