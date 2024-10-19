import './style.css'

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const sunGeo = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
	color: 0xffff00
});
const sun = new THREE.Mesh(sunGeo, sunMaterial);
scene.add(sun);

const earthGeo = new THREE.SphereGeometry(0.5, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({
	color: 0x0000ff
});
const earth = new THREE.Mesh(earthGeo, earthMaterial);
scene.add(earth);

const marsGeo = new THREE.SphereGeometry(0.4, 32, 32);
const marsMaterial = new THREE.MeshBasicMaterial({
	color: 0xff0000
});
const mars = new THREE.Mesh(marsGeo, marsMaterial);
scene.add(mars);

const spacecraftGeo = new THREE.SphereGeometry(0.1, 32, 32);
const spacecraftMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const spacecraft = new THREE.Mesh(spacecraftGeo, spacecraftMaterial);
scene.add(spacecraft);

let time = 0;
const earthOrbitRadius = 10;
const marsOrbitRadius = 15;
const transferOrbitRadius = earthOrbitRadius;

camera.position.z = 25;

function animate() {
	requestAnimationFrame(animate);
	time += 0.01;
	earth.position.x = earthOrbitRadius * Math.cos(time);
	earth.position.z = earthOrbitRadius * Math.sin(time);

	mars.position.x = marsOrbitRadius * Math.cos(time * 0.8);
	mars.position.z = marsOrbitRadius * Math.sin(time * 0.8);

	//hohmann transfer trajectory
	if (time < Math.PI) {
		const t = time / Math.PI;
		const transferAngle = t * Math.PI;
		spacecraft.position.x = transferOrbitRadius * Math.cos(transferAngle) * (1 - t) + marsOrbitRadius * t;
		spacecraft.position.z = transferOrbitRadius * Math.sin(transferAngle) * (1 - t) + marsOrbitRadius * t;
	} else {
		spacecraft.position.x = mars.position.x;
		spacecraft.position.z = mars.position.z;
	}

	renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
