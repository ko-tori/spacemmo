var Vector3 = THREE.Vector3;

class Ship {
	constructor(position, velocity, rotation, angvel) {
		this.vel = velocity;
		this.avel = angvel;
		this.model = new THREE.Object3D();
		if (!Ship.geometry || !Ship.materials) {
			console.error("Ship geometry and texture not loaded.");
			return;
		}
		var ship = new THREE.Mesh(Ship.geometry, Ship.materials);
		this.model.castShadow = true;
		this.model.position.x = position.x;
		this.model.position.y = position.y;
		this.model.position.z = position.z;
		this.model.name = socket.id;

		var scale = 0.0025;
		ship.scale.set(scale, scale, scale);

		this.model.add(ship);
		scene.add(this.model);
	}

	addCamera(c) {
		this.model.add(c);
	}

	update() {
		this.model.translateX(this.vel.x*dt/17);
		this.model.translateY(this.vel.y*dt/17);
		this.model.translateZ(this.vel.z*dt/17);
		this.model.rotateX(this.avel.x);
		this.model.rotateY(this.avel.y);
		this.model.rotateZ(this.avel.z);
	}
}
