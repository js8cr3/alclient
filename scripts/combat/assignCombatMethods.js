import { transformNodes } from './pathfinding/transformNodes.js'
import {
    getMonstersByType,
    getAggressiveMonster,
    getMonsterBoundary,
    getNearestMonsterInsideBoundary
} from './adventurelandUtils.js'
import { combatMisc, mage, warrior, priest, warriorMove } from './combat.js'
import { manouver } from './manouver.js'
import {
    retreatToSafety, 
    handleDeath, 
    teleportToSpot,
    requestMagiport,
    handleMagiportRequest
} from './nonCombat.js'
import { combatMain } from './combatMain.js'
import { followLeaderStrategy, aggroKiteStrategy } from './manouverStrategies.js'

export default function assignCombatMethods(character) {
	character.transformNodes = transformNodes;
	character.getMonstersByType = getMonstersByType;
	character.getAggressiveMonster = getAggressiveMonster;
	character.getMonsterBoundary = getMonsterBoundary;
	character.getNearestMonsterInsideBoundary = getNearestMonsterInsideBoundary;
	character.combatMisc = combatMisc;
	character.mage = mage;
	character.warrior = warrior;
	character.priest = priest;
	character.warriorMove = warriorMove;
	character.manouver = manouver;
	character.retreatToSafety = retreatToSafety;
	character.teleportToSpot = teleportToSpot;
	character.handleDeath = handleDeath;
	character.requestMagiport = requestMagiport;
	character.handleMagiportRequest = handleMagiportRequest;
	character.combatMain = combatMain;
	character.followLeaderStrategy = followLeaderStrategy;
	character.aggroKiteStrategy = aggroKiteStrategy;
}
