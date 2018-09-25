console.clear();
var ww = window.innerWidth,
  wh = window.innerHeight;

var renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("scene"),
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setSize(ww, wh);
renderer.setClearColor(0xA5DEE5);

var radius = 10;
var length = 200;
var amount = 1000;
var currentSpeed = 1;

var camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 10000);
camera.position.z = length*0.5;
camera.position.x = 200;
if (ww < 900) {
  camera.position.x = 400;
}
camera.lookAt(new THREE.Vector3(0,0,length*0.5));

var scene = new THREE.Scene();
var light = new THREE.HemisphereLight( 0xeeeecc, 0x72a6ad, 1 );
scene.add( light );
var light = new THREE.AmbientLight( 0x111111 );
scene.add( light );

var geometry = new THREE.Geometry();
for (var i = 0; i < amount; i++) {
  var x = Math.cos(i * 0.03) * radius;
  var y = Math.sin(i * 0.03) * radius;
  var z = i / amount * length;
  var vector = new THREE.Vector3(x, y, z);
  geometry.vertices.push(vector);
}

var slices = 200;
var rseg = 18;
var tubeRadius = 8;
var curve = new THREE.CatmullRomCurve3(geometry.vertices);
var tubeGeom = new THREE.Geometry();
tubeGeom.vertices = curve.getPoints(slices);
var geometry = new THREE.TubeGeometry(curve, slices, tubeRadius, rseg, false);
var material = new THREE.MeshPhongMaterial({
  color: 0xFFCFDF,
  emissive: 0x4e001a,
  wireframe: false
});

var circles = geometry.vertices.length / rseg;
for (var i = 0; i < circles; i++) {
  var color = new THREE.Color(
    "hsl(" + Math.floor(Math.random() * 360) + ",50%,50%)"
  );
  var ratio = Power2.easeIn.getRatio(i / slices);
  var center = tubeGeom.vertices[i];
  var ratio = Math.max(
    0,
    Math.min(1, Math.abs((center.z - length * 0.5) / (length * 0.5)))
  );
  for (var j = 0; j < rseg; j++) {
    geometry.colors[i * rseg + j] = color;
    var vector = geometry.vertices[i * rseg + j];
    vector.x -= (vector.x - center.x) * ratio;
    vector.y -= (vector.y - center.y) * ratio;
    vector.z -= (vector.z - center.z) * ratio;
  }
}
var spirals = new THREE.Object3D();
scene.add(spirals);
var spiral = new THREE.Mesh(geometry, material);
spirals.add(spiral);

var material = new THREE.MeshPhongMaterial({
  color: 0xE0F9B5,
  emissive: 0x1f2f04,
  wireframe: false
});
var spiral2 = new THREE.Mesh(geometry, material);
spiral2.rotation.z = Math.PI;
spirals.add(spiral2);

var boxGeom = new THREE.BoxGeometry(length * 5, length, length);
var boxMat = new THREE.MeshBasicMaterial({
  color: 0xA5DEE5,
  side: THREE.BackSide
});
var mesh = new THREE.Mesh(boxGeom, boxMat);
mesh.position.z = length * 0.5;
scene.add(mesh);

var duration = 3;
var ease = Power0.easeNone;
var radToDegree = 180 / Math.PI;
TweenMax.set(spiral, {
  three: {
    z: -length
  }
});
var tl = new TimelineMax({
  repeat: -1,
  onReverseComplete: function() {
    tl.totalTime(tl.duration() * 100).resume();
  },
  repeatDelay: 0
});
tl.to(
  spiral2,
  duration,
  {
    three: {
      rotationZ: Math.PI*5 * radToDegree
    },
    ease: ease
  },
  0
);
tl.to(
  spiral,
  duration,
  {
    three: {
      z: length,
      rotationZ: Math.PI * 24 * radToDegree
    },
    ease: ease
  },
  0 
);

var forward = true;
var prevDirection = true;
function render() {
  requestAnimationFrame(render);
  
  if (currentSpeed < 0) {
    currentSpeed = Math.min(-0.7, Math.max(-10, currentSpeed+0.06));
  } else {
    currentSpeed = Math.max(0.7, Math.min(10, currentSpeed-0.06));
  }
  forward = currentSpeed < 0;
  if (forward !== prevDirection) {
    tl.reversed(forward);
    prevDirection = forward;
  }
  
  tl.timeScale(Math.abs(currentSpeed));

  renderer.render(scene, camera);
}

function onResize() {
  ww = window.innerWidth;
  wh = window.innerHeight;
  camera.aspect = ww / wh;
  camera.updateProjectionMatrix();
  renderer.setSize(ww, wh);
  camera.position.x = 200;
  if (ww < 900) {
    camera.position.x = 400;
  }
}

function onScroll(e) {
  console.log(e)
  if (e.type === 'DOMMouseScroll') {
    currentSpeed += (e.detail * 0.5);
  } else {
    currentSpeed += (e.deltaY * 0.01);
  }
}
var mouseDown = false;
var prevMouse = null;
function onMouseMove(e) {
  e.preventDefault();
  var y = e.clientY;
  if(e.touches) {
    y = e.touches[0].clientY;
  }
  if (mouseDown) {
    if (prevMouse === null ){
      prevMouse = y;
      return;
    }
    currentSpeed += (y-prevMouse) * 0.03;
    prevMouse = y;
  }
  return false;
}
function onMouseDown(e) {
  e.preventDefault();
  mouseDown = true;
  return false;
}
function onMouseUp(e) {
  e.preventDefault();
  mouseDown = false;
  prevMouse = null;
  return false;
}

window.addEventListener("resize", onResize);
window.addEventListener("mousewheel", onScroll, false);
window.addEventListener("DOMMouseScroll", onScroll, false);
renderer.domElement.addEventListener("mousemove", onMouseMove, false);
renderer.domElement.addEventListener("touchmove", onMouseMove, false);
renderer.domElement.addEventListener("mousedown", onMouseDown, false);
renderer.domElement.addEventListener("touchstart", onMouseDown, false);
renderer.domElement.addEventListener("mouseup", onMouseUp, false);
renderer.domElement.addEventListener("touchend", onMouseUp, false);
document.addEventListener("mouseleave", onMouseUp);
requestAnimationFrame(render);
