"use strict";
(function(){

  let clock = new THREE.Clock();
  let camera;
  let controls;
  let scene;
  let renderer;
  let target = new THREE.Vector3();
  let mouse = {x: 0, y: 0};
  let objects = [];
  let transformControls = [];

  let obstacleCubeMesh, obstacleCubeBoundingMesh; 
  let obstacleCubeGeometry, obstacleCubeBoundingGeometry;
  let obstacleCubeMesh2, obstacleCubeBoundingMesh2; 
  let obstacleCubeGeometry2, obstacleCubeBoundingGeometry2;

  let obstacleCupBoundingMesh; 
  let obstacleCupGeometry, obstacleCupBoundingGeometry;


  let obstacleLaptopBoundingMesh; 
  let obstacleLaptopGeometry, obstacleLaptopBoundingGeometry;


  let obstacleBoilerBoundingMesh; 
  let obstacleBoilerGeometry, obstacleBoilerBoundingGeometry;

    
  let targetMesh, targetBoundingMesh; 
  let targetGeometry, targetBoundingGeometry;


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
    	d.mesh.position.set( Math.floor(Math.random() * 200) -400 , 30 , Math.floor(Math.random() * 400) -200 );
    	scene.add(d.mesh);
    });

  }

  let createScene = function() {


 
	// control.addEventListener( 'change', animate );

    let tableGeometry = new THREE.BoxGeometry( 400, 1, 400 );
    let tableMaterial = new THREE.MeshBasicMaterial( {color: 0x636363} );
    let tableMesh = new THREE.Mesh( tableGeometry, tableMaterial );
    tableMesh.position.set(0,-5,0);
	objects.push(tableMesh);
    scene.add( tableMesh );


	// targetGeometry = new THREE.BoxGeometry( 50, 50, 50 );
    // let targetMaterial = new THREE.MeshBasicMaterial( {color: 0xaddd8e} );
    // targetMesh = new THREE.Mesh( targetGeometry, targetMaterial );
    // targetMesh.position.set(0,25,0);
    // scene.add( targetMesh );



    targetBoundingGeometry = new THREE.SphereGeometry( 20, 30, 30 );
	let targetBoundingMaterial = new THREE.MeshBasicMaterial( {color: 0x2171b5, transparent: true, opacity: 0.7} );
	targetBoundingMesh = new THREE.Mesh( targetBoundingGeometry, targetBoundingMaterial); 

	scene.add(targetBoundingMesh);
	targetBoundingMesh.position.set(250, 30, 0);

	objects.push(targetBoundingMesh);

	let targetControl = new THREE.TransformControls( camera, renderer.domElement );
	targetControl.attach(targetBoundingMesh);
	transformControls.push(targetControl);
	
	let obstacleCubeControl = new THREE.TransformControls( camera, renderer.domElement );

    obstacleCubeGeometry = new THREE.BoxGeometry( 50, 50, 50 );
    let obstacleMaterial = new THREE.MeshBasicMaterial( {color: 0xaddd8e} );
    obstacleCubeMesh = new THREE.Mesh( obstacleCubeGeometry, obstacleMaterial );
    obstacleCubeMesh.position.set(-100,25,50);
    scene.add( obstacleCubeMesh );

    obstacleCubeBoundingGeometry = new THREE.SphereGeometry( 45, 10, 10 );
	let material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
	obstacleCubeBoundingMesh = new THREE.Mesh( obstacleCubeBoundingGeometry, material );
	
	obstacleCubeMesh.add( obstacleCubeBoundingMesh );

	objects.push(obstacleCubeBoundingMesh);

    obstacleCubeControl.attach(obstacleCubeMesh);
	transformControls.push(obstacleCubeControl);


    let obstacleCubeControl2 = new THREE.TransformControls( camera, renderer.domElement );

    obstacleCubeGeometry2 = new THREE.OctahedronGeometry( 50, 1);
    obstacleMaterial = new THREE.MeshBasicMaterial( {color: 0x2ca25f} );
    obstacleCubeMesh2 = new THREE.Mesh( obstacleCubeGeometry2, obstacleMaterial );
    obstacleCubeMesh2.position.set(100,25, 0);
    scene.add( obstacleCubeMesh2 );

    obstacleCubeBoundingGeometry2 = new THREE.SphereGeometry( 50, 10, 10 );
	material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.0} );
	obstacleCubeBoundingMesh2 = new THREE.Mesh( obstacleCubeBoundingGeometry2, material );
	
	obstacleCubeMesh2.add( obstacleCubeBoundingMesh2 );

	objects.push(obstacleCubeBoundingMesh2);

    obstacleCubeControl2.attach(obstacleCubeMesh2);
	transformControls.push(obstacleCubeControl2);



	var loader = new THREE.OBJLoader();

	loader.load( 'models/cup.obj', function ( obstacleCupMesh ) {

		var material = new THREE.MeshBasicMaterial( { color: 0x660000, side: THREE.DoubleSide } );

		obstacleCupMesh.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = material;

			}

		} );
		obstacleCupMesh.position.set(-100,0,-50);
		obstacleCupMesh.scale.set(15,15,15);

		scene.add( obstacleCupMesh );

		obstacleCupBoundingGeometry = new THREE.SphereGeometry( 3, 10, 10 );
		let obstacleCupmaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
		obstacleCupBoundingMesh = new THREE.Mesh( obstacleCupBoundingGeometry, obstacleCupmaterial );
		obstacleCupBoundingMesh.position.y = 2;

		obstacleCupMesh.add( obstacleCupBoundingMesh );

		objects.push(obstacleCupBoundingMesh);
		let obstacleCupControl = new THREE.TransformControls( camera, renderer.domElement );
		obstacleCupControl.attach(obstacleCupMesh);
		transformControls.push(obstacleCupControl);

	});


	loader.load( 'models/fan.obj', function ( obstacleLaptopMesh ) {

		var material = new THREE.MeshBasicMaterial( { color: 0xe6550d, side: THREE.DoubleSide } );

		obstacleLaptopMesh.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = material;

			}

		} );
		obstacleLaptopMesh.position.set(0,0,0);
		obstacleLaptopMesh.scale.set(5,5,5);
		
		scene.add( obstacleLaptopMesh );

		obstacleLaptopBoundingGeometry = new THREE.SphereGeometry( 7, 10, 10 );
		let obstacleLaptopmaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
		obstacleLaptopBoundingMesh = new THREE.Mesh( obstacleLaptopBoundingGeometry, obstacleLaptopmaterial );
		obstacleLaptopBoundingMesh.position.set(0, 5, 0);
	

		obstacleLaptopMesh.add( obstacleLaptopBoundingMesh );

		objects.push(obstacleLaptopBoundingMesh);
		let obstacleLaptopControl = new THREE.TransformControls( camera, renderer.domElement );
		obstacleLaptopControl.attach(obstacleLaptopMesh);
		transformControls.push(obstacleLaptopControl);

	});


	loader.load( 'models/monkey.obj', function ( obstacleBoilerMesh ) {

		var material = new THREE.MeshBasicMaterial( { color: 0x8856a7, side: THREE.DoubleSide } );

		obstacleBoilerMesh.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.material = material;

			}

		} );
		obstacleBoilerMesh.position.set(0,-30,-90);
		obstacleBoilerMesh.scale.set(75,75,75);
		
		scene.add( obstacleBoilerMesh );

		obstacleBoilerBoundingGeometry = new THREE.SphereGeometry( 0.4, 10, 10 );
		let obstacleBoilermaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0} );
		obstacleBoilerBoundingMesh = new THREE.Mesh( obstacleBoilerBoundingGeometry, obstacleBoilermaterial );
		obstacleBoilerBoundingMesh.position.set(-0.75, 0.7, -0.4);
	

		obstacleBoilerMesh.add( obstacleBoilerBoundingMesh );

		objects.push(obstacleBoilerBoundingMesh);
		let obstacleBoilerControl = new THREE.TransformControls( camera, renderer.domElement );
		obstacleBoilerControl.attach(obstacleBoilerMesh);
		transformControls.push(obstacleBoilerControl);

	});

  }
 
  let init = function() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 400, 0);


    controls = new THREE.OrbitControls( camera, document.getElementById('contanier'));

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );



    // let axisHelper = new THREE.AxisHelper(500);
    // scene.add( axisHelper );

    // scene.add( new THREE.GridHelper( 400, 10 ) );

  

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.getElementById('contanier').appendChild( renderer.domElement );

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


	if(d[0] && d[0].distance < 25 ){
		
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

	var vector = new THREE.Vector3();

	vector.set(
		( event.clientX / window.innerWidth ) * 2 - 1,
		- ( event.clientY / window.innerHeight ) * 2 + 1,
		0.5 );

	vector.unproject( camera );

	var dir = vector.sub( camera.position ).normalize();

	var distance = - camera.position.z / dir.z;

	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	
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
	
	target.set(targetBoundingMesh.position.x, targetBoundingMesh.position.y, targetBoundingMesh.position.z);
	
    requestAnimationFrame( animate );


    renderer.render( scene, camera );

  }

	let GUIControls = function () {
		this.reset = function() {
			_.forEach(boids, function(d) {
				scene.remove(d.mesh);
			});
			
			boids=[];
			createBoid(this.BoidSize);
		};
		this.displayTransform = false;
		this.displayColliders = false;
		this.BoidSize = 150;
		this.BoidRate = 0;

		
	};

  window.onload = function() {
	let control = new GUIControls();
	let gui = new dat.GUI();
	gui.add(control, "reset");
	gui.add(control, "displayTransform").onChange(function(checked) {
		if(checked)
		{
			_.forEach(transformControls, function(d){
				scene.add(d);
			})
		}
		else {
			_.forEach(transformControls, function(d){
				scene.remove(d);
			})
		}
	});
	gui.add(control, "displayColliders").onChange(function(checked) {
		if(checked) {
			_.forEach(objects, function(d) {
				console.log(d)
				if(d.parent.parent)
					d.material.opacity = 0.2;
			});
		}
		else {
			_.forEach(objects, function(d) {
				if(d.parent.parent)
					d.material.opacity = 0;
			});
		}
	});

	gui.add(control, "BoidSize", 2, 500).step(1);
	
  }



 
  /* start the application once the DOM is ready */
  document.addEventListener('DOMContentLoaded', init);


})();