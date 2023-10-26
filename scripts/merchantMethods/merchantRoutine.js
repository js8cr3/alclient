import chalk from 'chalk'
import * as impure from "../library/impure.js"
import { errorHandler } from "../library/errorHandler.js"
import { runPromiseUntilSuccess } from "../library/utils.js"

export default function merchantRoutine(partyList, itemsToBuy, itemsToSell, itemsToDeposit, restSpot, grindSpot, mageName) {
	
	// partyList: array
	// itemsToBuy: {name: string, qNeeded: number}
	// itemsToSell: array 
	// restSpot & grindSpot: IPosition

	const smartMoveOptions = { costs: {transport: 9999999, town: 9999999} };
	const [ 
		moveToBankMessage,
		depositItemsMessage,
		routineStartMessage, 
		reachCombatantsMessage,
		backToRestSpotMessage, 
		reachRestSpotMessage 
	] = [
		'Merchant moving to bank',
		'Merchant depositing items',
		'Merchant moving to combatants',
		'Merchant reached combatants',
		'Merchant moving back to rest spot',
		'Merchant arrived at rest spot'
	];

	return new Promise( async (resolve, reject) => {

		try {
		
			impure.timePrefix(moveToBankMessage, merchantRoutine.name);
			await this.closeMerchantStand();
			await this.smartMove('bank');
			await new Promise(r => setTimeout(r, 3000));

			impure.timePrefix(depositItemsMessage, merchantRoutine.name);
			await this.depositItemsToBank(itemsToDeposit);
			await this.smartMove({map: 'main', x: 168, y: -134}); // exit bank

			impure.timePrefix(routineStartMessage, merchantRoutine.name);
			for(let i = 0; this.ready; i++) {
				if(this.getPlayerByName(mageName)) break;
				if(i >= 3) throw new Error('No response to magiport request');
				impure.timePrefix(`Sent ${mageName} magiport request`, merchantRoutine.name, '#FFF');
				await this.sendCM([mageName], "{\"magiport\": true}");
				await new Promise(r=>setTimeout(r,10000));
			}

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

			impure.timePrefix(backToRestSpotMessage, 'merchantRoutine');
			const attemptSmartMove = () => this.smartMove(restSpot, smartMoveOptions);
			await runPromiseUntilSuccess(attemptSmartMove, errorHandler);

			impure.timePrefix(reachRestSpotMessage, 'merchantRoutine');
			await this.handleLoot(itemsToBuy, itemsToSell);
			resolve();

		} catch(error) {

			reject(error);

		}

	} );
	
}
