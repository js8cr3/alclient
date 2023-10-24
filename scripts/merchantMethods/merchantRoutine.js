import chalk from 'chalk'
import * as impure from "../library/impure.js"
import { errorHandler } from "../library/errorHandler.js"
import { runPromiseUntilSuccess } from "../library/utils.js"

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

	return new Promise( async (resolve, reject) => {

		const steps = [

			async () => {
				impure.timePrefix(routineStartMessage, merchantRoutine.name);
				for(let i = 0; this.ready; i++) {
					if(this.getPlayerByName(mageName)) break;
					if(i >= 3) throw new Error('No response to magiport request');
					impure.timePrefix(`Sent ${mageName} magiport request`, merchantRoutine.name, '#FFF');
					await this.sendCM([mageName], "{\"magiport\": true}");
					await new Promise(r=>setTimeout(r,10000));
				}
			},

			async () => {
				impure.timePrefix(reachCombatantsMessage, 'merchantRoutine');
				await this.sendCM(partyList, {"routine": true});
				for(const name of partyList) {
					const player = this.getPlayerByName(name);
					if(!player) continue;
					let success;
					let attemptCount = 0;
					while(!success && this.ready) {
						attemptCount++;
						if(attemptCount > 10) break;
						await this.mluck(name)
						.then( () => { success = true } )
						.catch(errorHandler)
						await new Promise( r => setTimeout(r, 1000) );
					}
				}
			},

			async () => {
				impure.timePrefix(backToRestSpotMessage, 'merchantRoutine');
				const attemptSmartMove = () => this.smartMove(restSpot, smartMoveOptions);
				await runPromiseUntilSuccess(attemptSmartMove, errorHandler);
			},

			async () => {
				impure.timePrefix(reachRestSpotMessage, 'merchantRoutine');
				await this.handleLoot(itemsToBuy, itemsToSell);
				resolve();
			}

		];

		try {
		
			for(const step of steps) {	
				if(this.rip) throw new Error('Character dead');
				await step();
			}

		} catch(error) {

			reject(error);

		}

	} );
	
}
