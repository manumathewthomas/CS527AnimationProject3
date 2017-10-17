"use strict";
(function(){

  let clock = new THREE.Clock();
  let camera;
  let controls;
  let scene;
  let renderer;
  let target = new THREE.Vector3(250, 50, 0);
  let mouse = {x: 0, y: 0};
  let objects = [];
  let obstacleCubeMesh, obstacleCubeBoundingMesh; 
  let obstacleCubeGeometry, obstacleCubeBoundingGeometry;
  let obstacleCubeMesh2, obstacleCubeBoundingMesh2; 
  let obstacleCubeGeometry2, obstacleCubeBoundingGeometry2;


  let boids = [];
  let v1, v2, v3;

  class Boid {
  	constructor() {
  		this.velocity = new THREE.Vector3(0, 0, 0);
  		this.acceleration = new THREE.Vector3(0, 0, 0);
  		this.maxSpeed = 0.4;
  		this.maxForce = 0.1;
  		this.geometry = new THREE.ConeGeometry( 3, 5, 32 );
  		this.axis = new THREE.Vector3(0, 1, 0);
		this.material = new THREE.MeshBasicMaterial( {color: 0xf03b20} );
		this.mesh = new THREE.Mesh(this.geometry, this.material );  
		this.cohesion = false;;
	}
  }

  let createBoid = function(n) {

  	_.times(n, function() {
  		boids.push(new Boid());
  	});

  	 _.forEach(boids, function(d){
  	 	d.mesh.rotateZ(-Math.PI / 2 );
    	d.mesh.position.set( Math.floor(Math.random() * 200) -400 , 50 , Math.floor(Math.random() * 400) -200 );
    	scene.add(d.mesh);
    });

  }

  let createScene = function() {


    let control = new THREE.TransformControls( camera, renderer.domElement );
	// control.addEventListener( 'change', animate );

    let tableGeometry = new THREE.BoxGeometry( 400, 1, 400 );
    let tableMaterial = new THREE.MeshBasicMaterial( {color: 0x636363} );
    let tableMesh = new THREE.Mesh( tableGeometry, tableMaterial );
    tableMesh.position.set(0,-5,0);
	objects.push(tableMesh);
    scene.add( tableMesh );

    obstacleCubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
    let obstacleMaterial = new THREE.MeshBasicMaterial( {color: 0xaddd8e} );
    obstacleCubeMesh = new THREE.Mesh( obstacleCubeGeometry, obstacleMaterial );
    obstacleCubeMesh.position.set(0,50,0);
    scene.add( obstacleCubeMesh );

    obstacleCubeBoundingGeometry = new THREE.SphereGeometry( 45, 10, 10 );
	let material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
	obstacleCubeBoundingMesh = new THREE.Mesh( obstacleCubeBoundingGeometry, material );
	
	obstacleCubeMesh.add( obstacleCubeBoundingMesh );

	objects.push(obstacleCubeBoundingMesh);

    control.attach(obstacleCubeMesh);
    scene.add(control);


    let control1 = new THREE.TransformControls( camera, renderer.domElement );

    obstacleCubeGeometry2 = new THREE.BoxGeometry( 50, 50, 50 );
    obstacleMaterial = new THREE.MeshBasicMaterial( {color: 0xaddd8e} );
    obstacleCubeMesh2 = new THREE.Mesh( obstacleCubeGeometry2, obstacleMaterial );
    obstacleCubeMesh2.position.set(0,50, -90);
    scene.add( obstacleCubeMesh2 );

    obstacleCubeBoundingGeometry2 = new THREE.SphereGeometry( 50, 10, 10 );
	material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.0} );
	obstacleCubeBoundingMesh2 = new THREE.Mesh( obstacleCubeBoundingGeometry2, material );
	
	obstacleCubeMesh2.add( obstacleCubeBoundingMesh2 );

	objects.push(obstacleCubeBoundingMesh2);

    control1.attach(obstacleCubeMesh2);
    scene.add(control1);

  }
 
  let init = function() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 400, 0);


    controls = new THREE.OrbitControls( camera );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );


   

    // let axisHelper = new THREE.AxisHelper(500);
    // scene.add( axisHelper );

    // scene.add( new THREE.GridHelper( 400, 10 ) );

  

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener('click', onMouseMove, false);

    /* animate the scene */
 	createScene();
    createBoid(150);

    animate();
  }

  let onWindowResize = function() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  let applyForce = function(boid, force) {
  	boid.acceleration.add(force);
  }

  let seek = function(boid, target) {
  	
  	let desired = new THREE.Vector3().subVectors(target, boid.mesh.position);
  	let steer = new THREE.Vector3();

  	if(desired.length() < 100) {
  		let m = THREE.Math.mapLinear(desired.length(), 0, 100, 0, boid.maxSpeed);
  		desired.setLength(m);
  	}
  	else {
  		desired.setLength(boid.maxSpeed);
  	}

    steer = new THREE.Vector3().subVectors(desired, boid.velocity);
  	steer.clampLength(steer.length(), boid.maxForce);

  	return steer;
  	
  }

  let cohesion = function(boid) {
  	let cohesionDistance = 2;
  	let sum = new  THREE.Vector3();
  	let steer = new THREE.Vector3();
  	let count = 0;

  	_.forEach(boids, function(d) {
  		let distance = d.mesh.position.distanceTo(boid.mesh.position);
  		if(distance > 0 && distance < cohesionDistance) {
  			sum.add(boid.mesh.position);
  			count++;
  		}
  	});

  	if(count > 0) {
  		sum.divideScalar(count);
  		return seek(boid, sum);
  	}

  	return steer;
  }

  let seperate = function(boid) {
  	let seperationDistance = 10;
  	let sum = new THREE.Vector3();
  	let steer = new THREE.Vector3();
  	let count = 0;

  	_.forEach(boids, function(d){
  		let distance = d.mesh.position.distanceTo(boid.mesh.position);
  		if(d != boid)
  			if(distance > 0 && distance < seperationDistance) {
  				let difference = new THREE.Vector3().subVectors(boid.mesh.position, d.mesh.position);
  				difference.normalize();
  				difference.divideScalar(distance);
  				sum.add(difference);
  				count++;
  			}
  	});

	if(count > 0) {
		sum.divideScalar(count);
		sum.normalize();
		sum.multiplyScalar(boid.maxSpeed);

		steer = new THREE.Vector3().subVectors(sum, boid.velocity);
		steer.clampLength(steer.length(), boid.maxForce);
	}

  	return steer;
  }

  let alignment = function(boid) {
  	let alignmentDistance = 2;
  	let sum = new THREE.Vector3();
  	let steer = new THREE.Vector3();
  	let count = 0;

  	_.forEach(boids, function(d){
  		if(d != boid) {
  			let distance = d.mesh.position.distanceTo(boid.mesh.position);
  			if(distance > 0 && distance < alignmentDistance) {
  				sum.add(d.velocity);
  				count++;
  			}
  		}
  	});

  	if(count > 0) {
		sum.divideScalar(count);
		sum.normalize();
		sum.multiplyScalar(boid.maxSpeed);

		steer = new THREE.Vector3().subVectors(sum, boid.velocity);
		steer.clampLength(steer.length(), boid.maxForce);
	}

  	return steer;
  }

  let obstacle = function(boid) {

	let raycaster = new THREE.Raycaster();
	let steer = new THREE.Vector3();
	raycaster.set(boid.mesh.position.clone(), boid.velocity.clone().normalize());
	let d = raycaster.intersectObjects(objects);
	console.log(d);

	if(d[0] && d[0].distance < 25 ){
		console.log(d);

		// var from = obstacleCubeBoundingMesh.position;
		// var to = d[0].face.normal;
		// var direction = to.clone().sub(from);
		// var length = 100;
		// var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff00ff );
		// scene.add( arrowHelper );
		steer = new THREE.Vector3().addVectors(d[0].face.normal, boid.velocity);
		steer.clampLength(steer.length(), boid.maxForce);
		boid.collision = true;
	}
	
	else {
		boid.collision = false;
	}
	return steer;
  }

  let update = function(boid) {
		
  	boid.velocity.add(boid.acceleration);
  	boid.velocity.clampLength(boid.velocity.length(), boid.maxSpeed);

    boid.mesh.quaternion.setFromUnitVectors(boid.axis, boid.velocity.clone().normalize());
	
  	boid.mesh.position.add(boid.velocity);
	
  	boid.acceleration.set(0, 0, 0);
  }

  let onMouseMove = function(event) {
	
  } 

  let flock = function() {

  	_.forEach(boids, function(d){


  		let seperateForce = new THREE.Vector3();
  		let alignmnetForce = new THREE.Vector3();
  		let cohesionForce = new THREE.Vector3();
		let obstacleForce = new THREE.Vector3();
  		let seekForce = new THREE.Vector3();
	
  	
  		seperateForce = seperate(d);
  		alignmnetForce = alignment(d);
  		cohesionForce = cohesion(d);
		obstacleForce = obstacle(d);
  		seekForce = seek(d, target);


  		seperateForce.multiplyScalar(0.1);
  		alignmnetForce.multiplyScalar(1);
  		cohesionForce.multiplyScalar(5);
		obstacleForce.multiplyScalar(0.5);
  		seekForce.multiplyScalar(0.05);

   		applyForce(d, seekForce);
  		applyForce(d, seperateForce);
  		applyForce(d, alignmnetForce);
  		applyForce(d, cohesionForce);
		applyForce(d, obstacleForce);


  		update(d);
  	});

  }

 

   let animate = function() {

   	flock();
    requestAnimationFrame( animate );


    renderer.render( scene, camera );

  }


 
  /* start the application once the DOM is ready */
  document.addEventListener('DOMContentLoaded', init);


})();