import { errorHandler } from '../library/errorHandler.js'
import { runPromiseUntilSuccess } from '../library/utils.js'
import { LocalStorage } from "../LocalStorage.js"

export {
	retreatToSafety, 
	handleDeath, 
	teleportToSpot,
	requestMagiport,
	handleMagiportRequest,
}


// active 

async function retreatToSafety(safeSpot) {
	await this.smartMove(safeSpot).catch(errorHandler)
}

// rip

async function handleDeath() {
	await new Promise(r => setTimeout(r, 15000));
	const respawnAttempt = () => this.respawn();
	await runPromiseUntilSuccess(respawnAttempt, errorHandler).catch( () => {
		if(character.rip) throw new Error('Respawn error');
	} );
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
        x = Math.round(x / 10) * 10
        y = Math.round(y / 10) * 10
		const blinkAttempt = () => this.blink(x, y);
		await runPromiseUntilSuccess(blinkAttempt, errorHandler);
	}

	if(this.map !== 'main' && this.map !== 'winterland') {
		const toMainAttempt = () => this.smartMove('main');
		await runPromiseUntilSuccess(toMainAttempt, errorHandler);
	}

	if(this.map === 'main') {
		await waitForBlink(-83, -422);
		await new Promise(r => setTimeout(r, 3000));
		const smartMoveAttempt = () => this.smartMove({map: 'winterland', x: -8, y: -337});
		await runPromiseUntilSuccess(smartMoveAttempt, errorHandler);
	}

	await waitForBlink(-442,-2154);
	await new Promise(r => setTimeout(r, 3000));

}

function requestMagiport(name) {
	this.sendCM([name], "{\"magiport\": true}").catch(errorHandler);

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
		if(!JSON.parse(data.message).magiport) return;

		LocalStorage.magiportCheck[data.name] = 'magiport';

	} );

	LocalStorage.magiportCheck = {};
	for(const name of partyNameList) LocalStorage.magiportCheck[name] = null;

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
		if(LocalStorage.combatState !== 'ready' && LocalStorage.combatState !== 'active') continue;

		// check whether anyone is requesting magiport
		const mList = LocalStorage.magiportCheck;
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
			await useMagiport(magiportTarget).then( () => mSuccess = true ).catch(errorHandler);
			await new Promise(r=>setTimeout(r,1000))
		}

		LocalStorage.magiportCheck[magiportTarget] = null;

	}
}
