var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

loader = new THREE.JSONLoader();
loader.load({ model: "ship.js", callback: shipLoaded });

function shipLoaded(geometry) {

	var material = new THREE.MeshFaceMaterial();

	xwing = new THREE.Object3D();

	ship = new THREE.Mesh(geometry, material);

	var scale = 0.8;
	ship.scale.set(scale, scale, scale);
	xwing.position.set(0, 0, -700);
	ship.rotation.set(0, Math.PI / 2, 0);

	ship.castShadow = true;
	ship.receiveShadow = false;

	xwing.addChild(ship);
	scene.addChild(xwing);

	// thrust
	var thrustImage = THREE.ImageUtils.loadTexture("img/thrust.png");
	var scale = 0.25;

	thrust0 = new THREE.Sprite({ map: thrustImage, useScreenCoordinates: false });
	thrust0.position.set(-175, 25, -42);
	thrust0.scale.set(scale, scale, scale);
	thrust0.blending = THREE.AdditiveBlending;
	ship.addChild(thrust0);

	thrust1 = new THREE.Sprite({ map: thrustImage, useScreenCoordinates: false });
	thrust1.position.set(-175, 25, 42);
	thrust1.scale.set(scale, scale, scale);
	thrust1.blending = THREE.AdditiveBlending;
	ship.addChild(thrust1);

	thrust2 = new THREE.Sprite({ map: thrustImage, useScreenCoordinates: false });
	thrust2.position.set(-175, -23, -42);
	thrust2.scale.set(scale, scale, scale);
	thrust2.blending = THREE.AdditiveBlending;
	ship.addChild(thrust2);

	thrust3 = new THREE.Sprite({ map: thrustImage, useScreenCoordinates: false });
	thrust3.position.set(-175, -23, 42);
	thrust3.scale.set(scale, scale, scale);
	thrust3.blending = THREE.AdditiveBlending;
	ship.addChild(thrust3);

	addParticles();
	loadingComplete();
}
