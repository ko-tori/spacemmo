class LaserBurst {
	constructor(position, rotation){
		this.model = new THREE.Object3D();
		this.model.position.x = position.x;
		this.model.position.y = position.y;
		this.model.position.z = position.z;

		this.model.rotation.x = rotation.x;
		this.model.rotation.y = rotation.y;
		this.model.rotation.z = rotation.z;
		var laser = new THREE.Mesh(new THREE.CubeGeometry(200,2,2),new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5 } ));
		this.model.add(laser);
		this.model.translateX(0);
		scene.add(this.model);
	}
	update(){
		this.model.translateX(200);
	}
}