import chalk from 'chalk'
import * as impure from "../library/impure.js"

export default function merchantRoutine(partyList, itemsToBuy, itemsToSell, restSpot, grindSpot) {
	
	// partyList: array
	// itemsToBuy: {name: string, qNeeded: number}
	// itemsToSell: array 
	// restSpot & grindSpot: IPosition

	const mageName  = 'Desk';
	const smartMoveOptions = { costs: {transport: 9999999, town: 9999999} };
	const routineStartMessage = 'Merchant moving to combatants';
	const reachCombatantsMessage = 'Merchant reached combatants';
	const backToRestSpotMessage = 'Merchant moving back to rest spot';
	const reachRestSpotMessage = 'Merchant arrived at rest spot';

	this.performingRoutine = true;

	return new Promise( async (resolve, reject) => {

		const steps = [

			async () => {
				impure.functionMessage(routineStartMessage, merchantRoutine.name);
				for(let i = 0; !this.magiportAccepted; i++) {
					impure.functionMessage(`Sent ${mageName} magiport request`, merchantRoutine.name, '#FFF');
					await this.sendCM([mageName], 'magiport');
					await new Promise(r=>setTimeout(r,5000));
					if(i >= 2) throw new Error('No response to magiport request');
				}
				this.magiportAccepted = undefined;
			},

			async () => {
				impure.functionMessage(reachCombatantsMessage, 'merchantRoutine');
				await this.sendCM(partyList, {"routine": true});
				for(const name of partyList) {
					const player = this.getPlayerByName(name);
					if(!player) continue;
					let success;
					while(!success && this.ready) {
						await this.mluck(name)
						.then( () => { success = true } )
						.catch( error => impure.functionMessage(error.toString(), merchantRoutine.name, '#f00') )
						await new Promise( r => setTimeout(r, 1000) );
					}
				}
			},

			async () => {
				impure.functionMessage(backToRestSpotMessage, 'merchantRoutine');
				await this.smartMove(restSpot, smartMoveOptions);
			},

			async () => {
				impure.functionMessage(reachRestSpotMessage, 'merchantRoutine');
				await this.handleLoot(itemsToBuy, itemsToSell);
			},

			async () => {
				resolve();
				this.performingRoutine = false;
			}

		];

		try {
		
			for(const step of steps) {	
				if(this.rip) throw new Error('Character dead');
				await step();
			}

		} catch(error) {

			this.performingRoutine = false;
			reject(error);

		}

	} );
	
}
