var laserSound = new Howl({
  src: ['assets/blaster.ogg']
});
class LaserBurst {
	constructor(position, rotation) {
		this.model = new THREE.Group();

		this.model.position.x = position.x;
		this.model.position.y = position.y;
		this.model.position.z = position.z;

		this.model.rotation.x = rotation.x;
		this.model.rotation.y = rotation.y;
		this.model.rotation.z = rotation.z;

		this.expire = 0;

		var laser1 = new THREE.Mesh(LaserBurst.geometry, LaserBurst.material);
		var laser2 = laser1.clone();
		var laser3 = laser1.clone();
		var laser4 = laser1.clone();
		
		laser1.translateX(54.5);
		laser1.translateY(0.7);
		laser1.translateZ(4.7);

		laser2.translateX(54.5);
		laser2.translateY(0.7);
		laser2.translateZ(-4.7);

		laser3.translateX(54.5);
		laser3.translateY(-1.5);
		laser3.translateZ(4.7);

		laser4.translateX(54.5);
		laser4.translateY(-1.5);
		laser4.translateZ(-4.7);

		this.model.add(laser1);
		this.model.add(laser2);
		this.model.add(laser3);
		this.model.add(laser4);
		
		laserSound.play();
		scene.add(this.model);
	}
	update() {
		this.model.translateX(50 * dt / 17);
		this.expire += dt / 17;
		if (this.expire > 100) {
			scene.remove(this.model);
			return true;
		}
		return false;
	}
}

LaserBurst.geometry = new THREE.CubeGeometry(100, 0.4, 0.4);
LaserBurst.material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 1 });
