"use strict";
(function(){

  let clock = new THREE.Clock();
  let camera;
  let controls;
  let scene;
  let renderer;

  let boids = [];
  let v1, v2, v3;

  class Boid {
  	constructor() {
  		this.velocity = new THREE.Vector3(-1, 0, 0);
  		this.geometry = new THREE.ConeGeometry( 5, 20, 32 );
		  this.material = new THREE.MeshBasicMaterial( {color: 0xf03b20} );
		  this.mesh = new THREE.Mesh(this.geometry, this.material );  	}
  }


  let createBoid = function(n) {

  	_.times(n, function() {
  		boids.push(new Boid());
  	});

  	 _.forEach(boids, function(d){
  	 	d.mesh.rotateZ(Math.PI / 2 );
  	 	d.mesh.position.set(Math.floor((Math.random() * 100) + 1), 0, Math.floor((Math.random() * 100) + 1));
    	scene.add(d.mesh);
    });

  }
 
  let init = function() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0 , 600 );

    controls = new THREE.OrbitControls( camera );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );

      var axisHelper = new THREE.AxisHelper(500);
    scene.add( axisHelper );

    scene.add( new THREE.GridHelper( 400, 10 ) );

  

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    /* animate the scene */

    createBoid(5);

    animate();
  }

  let onWindowResize = function() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  let cohesion = function(boid) {
  	let center = new  THREE.Vector3();

  	_.forEach(boids, function(d) {
  		if(d != boid)
  			center.add(d.mesh.position);
  	});

  	center = center.divideScalar(boids.length-1);

  	return (center.sub(boid.mesh.position)).divideScalar(100);
  }

  let seperate = function(boid) {
  	let velocity = new THREE.Vector3();

  	_.forEach(boids, function(d){
  		if(d != boid)
  			if(d.mesh.position.distanceTo(boid.mesh.position) < 10)
  				velocity = velocity.sub(d.mesh.position.sub(boid.mesh.position));
  	});

  	return velocity.divideScalar(100);
  }

  let alignment = function(boid) {
  	let velocity = new THREE.Vector3();

  	_.forEach(boids, function(d){
  		if(d != boid)
  			velocity = velocity.add(d.velocity);
  	});

  	velocity = velocity.divideScalar(boids.length-1);

  	return (velocity.sub(boid.velocity)).divideScalar(100);
  }

  let flock = function() {

  	_.forEach(boids, function(d){
  		v1 = cohesion(d);
  		v2 = seperate(d);
  		v3 = alignment(d);

  		d.velocity.add(v1);
  		d.velocity.add(v2);
  		d.velocity.add(v3);

  		d.mesh.position.add(d.velocity.multiplyScalar(1));
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