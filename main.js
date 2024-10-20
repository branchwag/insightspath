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

const earthOrbitRadius = 10;
const marsOrbitRadius = 15;
const transferDuration = Math.PI //half orbit for Hohmann transfer
let time = 0;

camera.position.z = 25;

function calculateHohmannPosition(t, startRadius, endRadius) {
	const theta = t * Math.PI;

	const semiMajorAxis = (startRadius + endRadius) / 2;
	const eccentricity = (endRadius - startRadius) / (endRadius + startRadius);

	const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(theta));

	return {
		x: r * Math.cos(theta),
		z: r * Math.sin(theta)
	};
}

function calculateLandingPath(t, marsPos, lastTransferPos) {
	const y = (1 - t) * (1 - t) * (1 - t) * 0.5;
	const x = lastTransferPos.x * (1 - t) * (1 - t) * (1 - t) +
		marsPos.x * (1 - (1 - t) * (1 - t) * (1 - t));
	const z = lastTransferPos.z * (1 - t) * (1 - t) * (1 - t) +
		marsPos.z * (1 - (1 - t) * (1 - t) * (1 - t));
	return { x, y, z };
}

let lastTransferPosition = { x: 0, z: 0 };
const landingDuration = 1.0;

function animate() {
	requestAnimationFrame(animate);
	time += 0.01;

	earth.position.x = earthOrbitRadius * Math.cos(time);
	earth.position.z = earthOrbitRadius * Math.sin(time);

	mars.position.x = marsOrbitRadius * Math.cos(time * 0.8);
	mars.position.z = marsOrbitRadius * Math.sin(time * 0.8);

	//spacecraft position
	if (time < transferDuration) {
		const t = time / transferDuration;
		const pos = calculateHohmannPosition(t, earthOrbitRadius, marsOrbitRadius);
		spacecraft.position.x = pos.x;
		spacecraft.position.z = pos.z;
		spacecraft.position.y = 0;

		if (t < 0.99) {
			lastTransferPosition = { x: pos.x, z: pos.z };
		}

	} else if (time < transferDuration + landingDuration) {
		const landingProgress = (time - transferDuration) / landingDuration;
		const landingPos = calculateLandingPath(
			landingProgress,
			{ x: mars.position.x, z: mars.position.z },
			lastTransferPosition
		);

		spacecraft.position.x = landingPos.x;
		spacecraft.position.y = landingPos.y;
		spacecraft.position.z = landingPos.z;


	} else {
		spacecraft.position.x = mars.position.x;
		spacecraft.position.z = mars.position.z;
		spacecraft.position.y = 0;
	}

	renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
