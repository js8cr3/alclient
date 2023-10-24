import { combat, combatMovement } from './combat.js'
import { combatMain } from './combatMain.js'
import { moveToBoss } from './moveToBoss.js'
import { handleMagiportRequest } from './handleMagiportRequest.js'

export function assignHalloweenMethods(character) {
//	const methods = [combat, combatMain, moveToBoss, switchIfNotInTargetServer, getHalloweenData, getHalloweenServer];
	character.combat = combat;
	character.combatMovement = combatMovement;
	character.combatMain = combatMain;
	character.moveToBoss = moveToBoss;
	character.handleMagiportRequest = handleMagiportRequest;
}
