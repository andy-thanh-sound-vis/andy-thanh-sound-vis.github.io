// CAPTURE THE SOUND
// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes
var audioCtx2 = new (window.AudioContext || window.webkitAudioContext)();
var source2;
var stream2;

// console.log(audioCtx2);


//set up the different audio nodes we will use for the app
var analyser2 = audioCtx2.createAnalyser();
analyser2.minDecibels = -90;
analyser2.maxDecibels = -10;
analyser2.smoothingTimeConstant = 0.85;

// var gainNode2 = audioCtx2.createGain();


//main block for doing the audio recording
var dataArrayAlt2;
if (navigator.mediaDevices.getUserMedia) {
   var constraints2 = { audio: true }
   navigator.mediaDevices.getUserMedia (constraints2)
      .then(
        function(stream2) {
           source2 = audioCtx.createMediaStreamSource(stream2);
           source2.connect(analyser2);
//            analyser2.connect(gainNode2);
//            gainNode2.connect(audioCtx2.destination);
           // analyser2.connect(audioCtx2.destination);
           analyser2.fftSize = 256;
           var bufferLengthAlt2 = analyser2.frequencyBinCount;
           dataArrayAlt2 = new Uint8Array(bufferLengthAlt2);
           analyser2.getByteFrequencyData(dataArrayAlt2);
      })
      .catch( function(err) {
        console.log('The following getUserMedia error occured: ' + err);
      });
} else {
        console.log('getUserMedia not supported on your browser!');
}



// VISUAL EFFECTS with help from https://aerotwist.com/tutorials/creating-particles-with-three-js/
// Constants
var NUM_BINS2 = 25; // Array of frequencies has 128 bins. Most of them are not used
var MAX_VOLUME_PER_BIN2 = 150;
var MAX_COLOR_PER_BIN2 = 100;

var BIN_FREQ_SIZE = 44100.0 / 256;
console.log("bin freq size", BIN_FREQ_SIZE)

var MIN_RADIUS2 = 10;
var MAX_RADIUS2 = 500;
var target_radius2 = 50;
var PARTICLE_SPEED2 = 3;

timeLapse2 = [];

// scene size
var WIDTH2 = window.innerWidth,
    HEIGHT2 = window.innerHeight;
// camera attributes
var VIEW_ANGLE2 = 45,
    ASPECT2 = WIDTH2 / HEIGHT2,
    NEAR2 = 0.1,
    FAR2 = 10000;

// Utility Functions
function rgbToHex2(r, g, b) {
  return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getRGB2(arr) {
  let redCount = 0;
  let greenCount = 0;
  let blueCount = 0;

  for (let i = 0; i < NUM_BINS / 3; i++) {
    blueCount += arr[i];
    greenCount +=  (1.1**i) * arr[i + Math.floor(NUM_BINS / 3)];
    redCount += (1.3**i) * arr[i + Math.floor((2 * NUM_BINS / 3))];
  }

  let totalCount = redCount + greenCount + blueCount;
  // console.log(redCount, greenCount, blueCount, totalCount);
  // return rgbToHex(Math.floor(redCount/totalCount * 255), Math.floor(greenCount/totalCount * 255), Math.floor(blueCount/totalCount * 255));
  return rgbToHex2(0,0,0);
}

function getParticleSpeed2(startingRadius) {
  return .1 + (startingRadius / 100) ** 1.7;
}

function getMaxFrequency(array, max) {
  let new_max = max;
  for (let i = 0; i < analyser2.fftSize / 2; i++) {
    if (array[i] > 50) {
      if (i * BIN_FREQ_SIZE > new_max) {
        console.log('************');
        console.log('i', i);
        console.log('new max', i * BIN_FREQ_SIZE);
        console.log(dataArrayAlt);
      }
      new_max = Math.max(new_max, i * BIN_FREQ_SIZE);
    }
  }
  return new_max;
}

// function getTargetRadius(target_radius, startingRadius) {
//   return target_radius - ((startingRadius / 100) ** 2);
// }

function getNewParticleCoordinates2(x, y, startingRadius) {
  let currRadius = Math.sqrt(x**2 + y**2);
  let angle = Math.asin(y / currRadius);
  if (y < 0) {
    angle += Math.PI;
  }
  let newX, newY;
  if (currRadius < target_radius) { // move point outward
    newX = Math.cos(angle) * (currRadius + getParticleSpeed(startingRadius));
    newY = Math.sin(angle) * (currRadius + getParticleSpeed(startingRadius));
  } else { // move point inward
    newX = Math.cos(angle) * (currRadius - getParticleSpeed(startingRadius));
    newY = Math.sin(angle) * (currRadius - getParticleSpeed(startingRadius));
  }
  return { x: newX * Math.sign(x),
           y: newY * Math.sign(y)
         };
}

function getVolumeRatio2(arr) {
  let volume = 0;
  for (let i = 0; i < NUM_BINS; i++) {
    volume += arr[i];
  }
  return volume / (NUM_BINS * MAX_VOLUME_PER_BIN);
}

// @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (
  function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };
  }
)();

// create a WebGL renderer2, camera and a scene
var renderer2 = new THREE.WebGLRenderer();
var camera2 = new THREE.Camera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene2 = new THREE.Scene();

// the camera starts at 0,0,0 so pull it backs
camera2.position.z = 1000;

// start the renderer2 - set the clear color to full black
renderer2.setClearColor(new THREE.Color(0, 1));
renderer2.setSize(WIDTH, HEIGHT);


// attach the render-supplied DOM element
var $container2 = $('#container2');
$container2.append(renderer2.domElement);


particleSystems = [];
for (let systemNum = 0; systemNum < 2000; systemNum++) {
  let systemParticles = new THREE.Geometry();
  for (let i = 0; i < 800; i++) {
    let particle = new THREE.Vertex( new THREE.Vector3(0, 0, 0) );
    systemParticles.vertices.push(particle);
  }
  let systemMaterial = new THREE.ParticleBasicMaterial({
    color: 0xFFFFFF,
    size: 4
  });
  let particleSystemm = new THREE.ParticleSystem(
    systemParticles,
    systemMaterial);
  particleSystems.push(particleSystemm);
  // particleSystemVertices.push(systemParticles);
  scene2.addChild(particleSystemm);
}

// moving outwards or not
var out2 = true;

var oldSize = 0;

var maxFreq = 0;
// animation loop
function update2() {
  // console.log("here")
  if (timeLapse.length > 0) {
    if (oldSize != timeLapse.length) {
      maxFreq = getMaxFrequency(dataArrayAlt, maxFreq);
      console.log(maxFreq);
      oldSize = timeLapse.length;

      let numColumns = timeLapse.length;
      let currXPos = 0;
      let xStep = window.innerWidth / numColumns;
      // let currParticleIndex = 0;
      for (let i = 0; i < timeLapse.length; i++) {
        let heightColor = timeLapse[i];
        let currYPos = 0;
        let yStep = heightColor.height / 100;
        let system = particleSystems[i];
        // let vertices = particleSystemVertices[i];
        // console.log(vertices);
        // console.log(system.geometry.vertices);
        system.materials[0].color = new THREE.Color(heightColor.color);
        for (let j = 0; j < 100; j+=1) {
          // console.log("here");
          let particle = system.geometry.vertices[j];
          // console.log("here")
          particle.position.x = currXPos + (Math.random() * 5) - window.innerWidth / 2;
          particle.position.y = currYPos+ (Math.random() * 5) - 200;
          // console.log("here");
          currYPos = currYPos + yStep;
        }
        system.geometry.__dirtyVertices = true;
        currXPos = currXPos + xStep;
      }
    }
  }

  // flag to the particle system that we've
  // changed its vertices. This is the
  // dirty little secret.
  // particleSystem2.geometry.__dirtyVertices = true;

  renderer2.render(scene2, camera2);

  // set up the next call
  requestAnimFrame(update2);
}

requestAnimFrame(update2);

setInterval(function(){
  if(timeLapse) {
    // console.log(timeLapse);
  }
}, 1000);
