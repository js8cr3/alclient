import { randomColor, randomHexNum } from "../library/utils.js"
import * as impure from '../library/impure.js'
import { errorHandler } from "../library/errorHandler.js"
import { Halloween } from "./Halloween.js"
import { LocalStorage } from "../LocalStorage.js"

const mapList = ['main', 'halloween', 'level1', 'level2', 'spookytown'];

export async function combatMain(characterNamesByClass) {

	const character = this;
	LocalStorage.attackMode = true;

	if(character.ctype === 'mage') mageMain();
	if(character.ctype !== 'mage') nonMageMain();

	// log coop contribution points
	while(this.ready) {
		await new Promise(r=>setTimeout(r,1000*60));
		const coopData = character.s.coop;
		if(!coopData) continue;
		const targetMonster = character.entities.get(coopData.id);
		if(!targetMonster) continue;
		impure.timePrefix(`${character.name} ${targetMonster.name} contribution: ${Math.floor(coopData.p)}`, combatMain.name, '#f90');
	}

	async function nonMageMain() {

		const combatInterval = setInterval( () => character.combat(characterNamesByClass), 70);
		const movementInterval = setInterval( () => character.combatMovement(), 500);
		
		while(character.ready) { 
			if(character.rip) character.respawn().catch(errorHandler);
			if(!character.getPlayerByName(characterNamesByClass.mage)) {
				impure.timePrefix(`${character.name} sent magiport request to ${characterNamesByClass.mage}`, nonMageMain.name, '#55f');
				character.sendCM([characterNamesByClass.mage], {"magiport": true}).catch(errorHandler);
			}
			await new Promise(r=>setTimeout(r,10000));
		};

		clearInterval(combatInterval);
		clearInterval(movementInterval);

	}

	async function mageMain() {
		
		character.handleMagiportRequest(Object.values(characterNamesByClass));
		const isInPathfindableMap = () => {
			let isIn = false;
			for(const map of mapList) {
				if(character.map === map) isIn = true;	
			}
			impure.timePrefix(character.name + ' in pathfindable map: '+isIn, mageMain.name, '#afa');
			return isIn;
		}
		
		let ready = true;
		if( !isInPathfindableMap() ) {
			ready = false;
			await character.smartMove('main').then( () => ready = true );
		}
		
		if(!ready) {
			impure.timePrefix(character.name + 'disconnecting', mageMain.name, '#afa');
			character.disconnect();
		};
		
		const combatInterval = setInterval( () => character.combat(characterNamesByClass), 70);
		const movementInterval = setInterval( () => character.combatMovement(), 500);

		while(character.ready) {

			try {

				await new Promise(r=>setTimeout(r,1000));

				impure.timePrefix('mage search loop');
				if(character.rip) {
					impure.timePrefix(character.name + ' died, awaiting respawn', nonMageMain.name, '#f55');
					await new Promise(r=>setTimeout(r,15000));
					await character.respawn();
					await new Promise(r=>setTimeout(r,2000));
				}

				let failed = false;
				await character.moveToBoss(Halloween.data.type /*monster mtype*/).catch( error => {
					failed = true;
					console.error(error);
				} );
				if(failed) continue;

				const boss = () => character.getEntity({type: Halloween.data.type});
				while( boss() && !character.rip && character.ready ) {
					await new Promise(r=>setTimeout(r,1000));
				}

			} catch(e) {
				impure.timePrefix(e, undefined, '#f00');
				console.error(e);
			}

		}

		clearInterval(combatInterval);
		clearInterval(movementInterval);
		
	}

}
