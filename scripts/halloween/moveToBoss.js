import * as utils from "../library/utils.js"
import * as impure from "../library/impure.js"
import { pathfinding } from './pathfinding.js'

export async function moveToBoss(mtype) {
	
	// mtype: 'mrpumpkin', 'mrgreen'

	const character = this;

	if(mtype !== 'mrgreen' && mtype !== 'mrpumpkin') throw new Error('mtype not supported');

	const orangeSpot = [-200, 770];
	const greenSpot = [550, 1000];

	const mainToHalloweenDoor = {map: 'main', x: 1600, y: -520};
	const halloweenToMainDoor = {map: 'halloween', x: 1210, y: 100};
	const halloweenToEntranceDoor = {map: 'halloween', x: -1070, y: -1480};
	const entranceToHalloweenDoor = {map: 'level1', x: -410, y: -250};
	const entranceToPassingDoor = {map: 'level1', x: -330, y: 510};
	const passingDoor = {map: 'level2', x: 30, y: 20}; // passingToSpookytown and passingToEntrance shares same coor
	const spookytownToPassingDoor = {map: 'spookytown', x: 190, y: -190};

	const mapTreeWithDirections = { 
		main: {
			'halloween': {door: mainToHalloweenDoor, destination: halloweenToMainDoor}, 
		},
		halloween: {
			'main': {door: halloweenToMainDoor, destination: mainToHalloweenDoor}, 
			'level1': {door: halloweenToEntranceDoor, destination: entranceToHalloweenDoor}
		},
		level1: {
			'halloween': {door: entranceToHalloweenDoor, destination: halloweenToEntranceDoor}, 
			'level2': {door: entranceToPassingDoor, destination: passingDoor}
		},
		level2: {
			'level1': {door: passingDoor, destination: entranceToPassingDoor}, 
			'spookytown': {door: passingDoor, destination: spookytownToPassingDoor}
		},
		spookytown: {
			'level2': {door: spookytownToPassingDoor, destination: passingDoor}
		}
	};

	// for pathfinding
	const mapTree = {};
	for(const map in mapTreeWithDirections) {
		mapTree[map] = [];
		for(const neighbor in mapTreeWithDirections[map]) {
			mapTree[map].push(neighbor);
		}
	}

	const findPath = (currentMapName, targetMapName) => {
		return pathfinding(currentMapName, targetMapName, mapTree);
	}
	
	const waitForBlink = async (x, y) => {

		while(true) {

			while(character.mp < 2000) {
				await new Promise(r=>setTimeout(r,1000));
			}

			await character.blink(x, y);
			// await smart_move({x, y});
			await new Promise(r=>setTimeout(r,2000));
			if(utils.distance(character, {x, y}) < 200) return true;

		}

	}

	const moveToMap = async directions => {
		
		if(!directions) throw new Error('moveToPath direction error');
		if(character.map !== 'level2') { // no need to blink in this specific map
			await waitForBlink(directions.door.x, directions.door.y);
		}
		await character.smartMove(directions.destination);

	}
	
	const getDestination = () => {
		if(mtype === 'mrpumpkin') return 'halloween';
		if(mtype === 'mrgreen') return 'spookytown';
		throw new Error('getDestination: mtype error');
	}

	const pathToBoss = findPath(character.map, getDestination());
	if(pathToBoss === 'Path not found') throw new Error(pathToBoss);
	
	for(let i = 0; i < pathToBoss.length - 1; i++) {
		const currentMap = pathToBoss[i];
		const targetMap = pathToBoss[i+1];
		const directions = mapTreeWithDirections[currentMap][targetMap];
		await moveToMap(directions);
	}
	
	let bossSpot;
	if(mtype === 'mrgreen') {
		bossSpot = greenSpot;
	} else if (mtype === 'mrpumpkin') {
		bossSpot = orangeSpot;	
	}
	
	// await smart_move({x: bossSpot[0], y: bossSpot[1]});
	await waitForBlink(...bossSpot)
	impure.timePrefix(character.name + ' arrived to ' + mtype);

}
