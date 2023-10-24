import { rogueCombatLoop } from "./rogue.js"
import { attackTargetOrMove } from "./combatMethods.js"

export function assignRogueMethods(character) {
	character.rogueCombatLoop = rogueCombatLoop;
	character.attackTargetOrMove = attackTargetOrMove;
}
