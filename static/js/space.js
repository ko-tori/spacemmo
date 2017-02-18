var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 200;

var ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;

scene.add( spotLight );

var loader = new THREE.JSONLoader();
loader.load("assets/ship.json", shipLoaded);

var particleArray = [];
var xwing, ship;

function shipLoaded(geometry, materials) {
	xwing = new THREE.Object3D();

	ship = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

	var scale = 0.25;
	ship.scale.set(scale, scale, scale);

	ship.castShadow = true;
	ship.receiveShadow = false;

	xwing.add(ship);
	scene.add(xwing);

	render();
}

var render = function() {
	requestAnimationFrame(render);

	ship.rotateX(0.1);
	ship.rotateY(0.1);

	renderer.render(scene, camera);
};