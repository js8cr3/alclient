import chalk from "chalk"
import { errorHandler } from "../library/errorHandler.js"
import * as utils from "../library/utils.js"
import * as impure from "../library/impure.js"

export function attackTargetOrMove(target, distanceRatio) {
	if(!target) return;
	if( this.moveTowardsTargetIfNotInRange(target, distanceRatio) ) return;
	if( !this.hasEnoughHPOrMP('mp', 0.5) ) return;
	if(this.isOnCooldown('attack')) return;
	this.basicAttack(target.id)
	.catch( errorHandler );
}
