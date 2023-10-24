import { errorHandler } from '../library/errorHandler.js'
import { LocalStorage } from "../LocalStorage.js"
import * as impure from "../library/impure.js"

export async function handleMagiportRequest(partyNameList) {

   this.socket.on('cm', data => {

		let isPartyMember;
		for(const memberName of partyNameList) {
			if(data.name !== memberName) continue;
			isPartyMember = true;
			break;
		}   
		if(!isPartyMember) return;
		if(!JSON.parse(data.message).magiport) return;

		let refuse;
		if(!this.target) refuse = true;
		if(this.target && !this.getEntityByID(this.target)) refuse = true;
		if(refuse) {
            impure.timePrefix(`Refused ${data.name}'s magiport request`, handleMagiportRequest.name, '#ccf');
            return;
		}

		LocalStorage.magiportCheck[data.name] = 'magiport';

	} );

	LocalStorage.magiportCheck = {};
	for(const name of partyNameList) LocalStorage.magiportCheck[name] = null;

	const useMagiport = name => { return new Promise( async (resolve, reject) => {
		const cleanup = setTimeout( () => reject('no response from ' + name + ' (useMagiport timeout)'), 5000);
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
