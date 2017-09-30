"use strict";
(function(){

  let clock = new THREE.Clock(),
    camera, controls, scene, renderer, mixer, skeletonHelper;


  function setupSkeleton(result) {
   
      skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
      skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to SkeletonHelper directly

      let boneContainer = new THREE.Group();
      boneContainer.add( result.skeleton.bones[ 0 ] );

      scene.add( skeletonHelper );
      scene.add( boneContainer );

       let staticJoint = [];
       let dynamicJoint = [];

       _.forEach(result.clip.tracks, function(d) {
          if(d.times.length == 2)
            staticJoint.push(d);
          else
            dynamicJoint.push(d);
       });

       console.log(result.clip.tracks[0])

       _.forEach(result.clip.tracks[0].times, function(d,i) {
            controlPoints = {
                              pt1:{x:0 ,y:0, z:0},
                              pt2:{x:0 ,y:0, z:0},
                              pt3:{x:0 ,y:0, z:0},
                              pt4:{x:0 ,y:0, z:0}
                            };
            if(i<=result.clip.tracks[0].times.length-3)
            {
              controlPoints.pt1.x = result.clip.tracks[0].values[i]
            }
       });

      // play animation
      // mixer = new THREE.AnimationMixer( skeletonHelper );
      // mixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
  }


  function loadBVH(model) {
    return new Promise(function(resolve, reject) {
      let loader = new THREE.BVHLoader();
      loader.load( model, function(result){
        resolve(result);
      });
    });
  }


  function init() {

    /* Load the BVH models*/
    loadBVH("models/bvh/Male1_Run.bvh").then(function(result){
      /* Setup the model once the async data fetch resolves  */
      setupSkeleton(result);
    });

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 200, 400 );

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
    animate();
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function animate() {

    requestAnimationFrame( animate );

    let delta = clock.getDelta();

    if ( mixer ) mixer.update( delta );

    renderer.render( scene, camera );

  }

  function bSpline(t, controlPoints) {
    let t2 = t * t;
    let t3 = t2 * t;
    let mt = 1-t;
    let mt2 = mt * mt;
    let mt3 = mt2 * mt;

    return (scalarVectorProduct(mt3 * controlPoints.pt0) + 
              scalarVectorProduct(3*mt2*t, controlPoints.pt1) + 
              scalarVectorProduct(3*mt*t2, controlPoints.pt2) + 
              scalarVectorProduct(t3, controlPoints.pt3));
  }

  let scalarVectorProduct = function(a, B)
  {
      let C = {x:0, y:0, z:0};
      C.x = B.x * a;
      C.y = B.y * a;
      C.z = B.z * a;

      return C;
  }

  /* start the application once the DOM is ready */
  document.addEventListener('DOMContentLoaded', init);

})();