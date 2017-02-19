class LaserBurst {
	constructor(position, rotation){
		this.model = new THREE.Object3D();
		this.model.position.x = position.x;
		this.model.position.y = position.y;
		this.model.position.z = position.z;

		this.expire = 0;

		this.model.rotation.x = rotation.x;
		this.model.rotation.y = rotation.y;
		this.model.rotation.z = rotation.z;
		var laser1 = new THREE.Mesh(new THREE.CubeGeometry(200,2,2),new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1 } ));
		laser1.translateX(83);
		laser1.translateY(-30);
		laser1.translateZ(-50);
		var laser2 = new THREE.Mesh(new THREE.CubeGeometry(200,2,2),new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1 } ));
		laser2.translateX(83);
		laser2.translateY(-30);
		laser2.translateZ(50);
		var laser3 = new THREE.Mesh(new THREE.CubeGeometry(200,2,2),new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1 } ));
		laser3.translateX(83);
		laser3.translateY(-55);
		laser3.translateZ(50);
		var laser4 = new THREE.Mesh(new THREE.CubeGeometry(200,2,2),new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1 } ));
		laser4.translateX(83);
		laser4.translateY(-55);
		laser4.translateZ(-50);

		this.model.add(laser1);
		this.model.add(laser2);
		this.model.add(laser3);
		this.model.add(laser4);

		scene.add(this.model);
	}
	update(){
		this.model.translateX(200);
		this.expire += 1;
		if (this.expire > 100){
			scene.remove(this.model);
			return true;
		}
		return false;
	}
}