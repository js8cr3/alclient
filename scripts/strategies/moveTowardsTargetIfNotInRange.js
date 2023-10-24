import { errorHandler } from "../library/errorHandler.js"
import * as utils from "../library/utils.js"

let customMoveCooldown;

export function moveTowardsTargetIfNotInRange(target, distanceRatio) {

	if( utils.distance(this, target) >= this.range ) { 

		if(customMoveCooldown) return true;

		customMoveCooldown = true;
		setTimeout(() => customMoveCooldown = false, 250);

    	this.move(
    		this.x+(target.x-this.x)*distanceRatio,
    		this.y+(target.y-this.y)*distanceRatio
    	)
    	.catch( errorHandler );
        return true;
    }   

}
