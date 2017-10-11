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
  		this.velocity = new THREE.Vector3(-5, 0, 0);
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
  	 	d.mesh.position.set(Math.floor((Math.random() * 50) + 1), Math.floor((Math.random() * 50) + 1), Math.floor((Math.random() * 50) + 1));
    	scene.add(d.mesh);
    });

  }
 
  let init = function() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0 , 600 );

    controls = new THREE.OrbitControls( camera );
    controls.minDistance = 300;
    controls.maxDistance = 700;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xeeeeee );

    scene.add( new THREE.GridHelper( 400, 10 ) );

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    /* animate the scene */

    createBoid(500);

  
    console.log(boids);

    animate();
  }

  let onWindowResize = function() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  let rule1 = function(boid) {
  	let center = new  THREE.Vector3();

  	_.forEach(boids, function(d) {
  		if(d != boid)
  			center.add(d.mesh.position);
  	});

  	center = center.divideScalar(boids.length-1);

  	return (center.sub(boid.mesh.position)).divideScalar(100);
  }

  let rule2 = function(boid) {
  	let velocity = new THREE.Vector3();

  	_.forEach(boids, function(d){
  		if(d != boid)
  			if(d.mesh.position.distanceTo(boid.mesh.position) < 5)
  				velocity = velocity.sub(d.mesh.position.sub(boid.mesh.position));
  	});

  	return velocity
  }

  let rule3 = function(boid) {
  	let velocity = new THREE.Vector3();

  	_.forEach(boids, function(d){
  		if(d != boid)
  			velocity = velocity .add(d.velocity);
  	});

  	velocity = velocity.divideScalar(boids.length-1);

  	return (velocity.sub(boid.velocity)).divideScalar(8);
  }

  let flock = function() {

  	_.forEach(boids, function(d){
  		v1 = rule1(d);
  		v2 = rule2(d);
  		v3 = rule3(d);

  		d.velocity.add(v1);
  		d.velocity.add(v2);
  		d.velocity.add(v3);

  		d.mesh.position.add(d.velocity);
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