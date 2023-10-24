import * as impure from '../library/impure.js'
import { errorHandler } from '../library/errorHandler.js'

export {
	retreatToSafety, 
	handleDeath, 
	teleportToSpot,
	requestMagiport,
	handleMagiportRequest,
}


// active 

async function retreatToSafety(safeSpot) {
	await this.smartMove(safeSpot)
}

// rip

async function handleDeath() {
	await new Promise(r => setTimeout(r, 15000));
	await this.respawn();
}

// inactive

async function teleportToSpot() {

	const waitForMP = async () => {
		while(this.mp < 1600 && this.ready) {
			await new Promise(r => setTimeout(r, 1000));
		}
	}

	const waitForBlink = async (x, y) => {
		await waitForMP();
		await this.blink(x, y);
	}

	if(this.map === 'main') {
		await waitForBlink(-83, -422);
		await new Promise(r => setTimeout(r, 3000));
		await this.smartMove({map: 'winterland', x: -8, y: -337});
	}

	await waitForBlink(-442,-2154);
	await new Promise(r => setTimeout(r, 3000));

}

function requestMagiport(name) {
	this.sendCM([name], 'magiport');
}

// startup

async function handleMagiportRequest(partyNameList) {

   this.socket.on('cm', data => {

		let isPartyMember;
		for(const memberName of partyNameList) {
			if(data.name !== memberName) continue;
			isPartyMember = true;
			break;
		}   
		if(!isPartyMember) return;
		if(data.message !== 'magiport') return;

		this.magiportCheck[data.name] = 'magiport';

	} );

	this.magiportCheck = {};
	for(const name of partyNameList) this.magiportCheck[name] = null;

	const useMagiport = name => { return new Promise( async (resolve, reject) => {
		const cleanup = setTimeout( () => reject('useMagiport magiport timeout'), 5000);
		await this.magiport(name).catch(errorHandler); 
		for(let i = 0; i < 5; i++) {
			if(this.getPlayerByName(name)) {
				clearTimeout(cleanup)
				return resolve();
			}
			await new Promise(r=>setTimeout(r, 1000));
		}
	} ) }

	while(this.ready) {

		await new Promise(r => setTimeout(r, 1000));
		if(this.combatState !== 'ready' && this.combatState !== 'active') continue;

		// check whether anyone is requesting magiport
		const mList = this.magiportCheck;
		let magiportTarget;
		for(const name in mList) {
			if(!mList[name]) continue;
			magiportTarget = name;	
			break;
		}
		if(!magiportTarget) continue;

		// wait for target to be teleported
		let mSuccess = false;
		while( !mSuccess && this.ready ) {
			while(this.mp < 1000 && this.ready ) {
				await new Promise(r => setTimeout(r, 1000));
			}
			await useMagiport(magiportTarget).then( () => mSuccess = true ).catch(console.error);
			await new Promise(r=>setTimeout(r,1000))
		}

		this.magiportCheck[magiportTarget] = null;

	}
}
