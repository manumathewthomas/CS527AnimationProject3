"use strict";
(function(){

  let clock = new THREE.Clock();
  let camera;
  let controls;
  let scene;
  let renderer;
  let target = new THREE.Vector3(250, 0, 0);
  let mouse = {x: 0, y: 0};
  let objects = [];
  let obstacleMesh; 
  let obstacleGeometry;


  let boids = [];
  let v1, v2, v3;

  class Boid {
  	constructor() {
  		this.velocity = new THREE.Vector3(0, 0, 0);
  		this.acceleration = new THREE.Vector3(0, 0, 0);
  		this.maxSpeed = 0.5;
  		this.maxForce = 0.2;
  		this.geometry = new THREE.ConeGeometry( 3, 5, 32 );
  		this.axis = new THREE.Vector3(0, 1, 0);
		this.material = new THREE.MeshBasicMaterial( {color: 0xf03b20} );
		this.mesh = new THREE.Mesh(this.geometry, this.material );  
		this.collision = false;	

	}
  }

  let createBoid = function(n) {

  	_.times(n, function() {
  		boids.push(new Boid());
  	});

  	 _.forEach(boids, function(d){
  	 	d.mesh.rotateZ(-Math.PI / 2 );
    	d.mesh.position.set( Math.floor(Math.random() * 200) -400 , 10 , Math.floor(Math.random() * 400) -200 );
    	scene.add(d.mesh);
    });

  }

  let createScene = function() {

    let tableGeometry = new THREE.BoxGeometry( 400, 1, 400 );
    let tableMaterial = new THREE.MeshBasicMaterial( {color: 0x636363} );
    let tableMesh = new THREE.Mesh( tableGeometry, tableMaterial );
    tableMesh.position.set(0,-5,0);
	objects.push(tableMesh);
    scene.add( tableMesh );

    obstacleGeometry = new THREE.BoxGeometry( 50, 50, 50 );
	obstacleGeometry.computeBoundingSphere();
    let obstacleMaterial = new THREE.MeshBasicMaterial( {color: 0xaddd8e} );
    obstacleMesh = new THREE.Mesh( obstacleGeometry, obstacleMaterial );
    obstacleMesh.position.set(0,25,0);
    scene.add( obstacleMesh );

	var cubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
	var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );

  }
 
  let init = function() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 400, 0);


    controls = new THREE.OrbitControls( camera );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );


    createScene();

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

    createBoid(50);

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
	raycaster.set(boid.mesh.position, boid.velocity.clone().normalize());
	let d = raycaster.intersectObject(obstacleMesh);
	if(d[0] && d[0].distance>0 && d[0].distance < 50)
	{
		steer = new THREE.Vector3().subVectors(d[0].face.normal, boid.velocity);
		steer.clampLength(steer.length(), boid.maxForce);
		boid.collision = true;
	}
	else
	boid.collision = false;
		
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
  		cohesionForce.multiplyScalar(1);
		obstacleForce.multiplyScalar(5);
  		seekForce.multiplyScalar(1);

  		applyForce(d, seperateForce);
  		applyForce(d, alignmnetForce);
  		applyForce(d, cohesionForce);
		applyForce(d, obstacleForce);
		if(!d.collision)
			applyForce(d, seekForce);


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