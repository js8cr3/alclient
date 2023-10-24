import * as impure from '../library/impure.js'
import { runPromiseUntilSuccess } from "../library/utils.js"
import { errorHandler } from "../library/errorHandler.js"

export function moveInsideMonsterBoundary([x1, y1, x2, y2], monsterSpot) {

	let left = x1, right = x2, up = y1, down = y2;
	if(x1 > x2) {
		left = x2; right = x1;
	}
	if(y1 > y2) {
		down = y1; up = y2;
	}

	return new Promise( async (resolve, reject) => {

		if(	this.x > left && this.x < right && 
			this.y > up && this.y < down
		) {
			impure.timePrefix(this.id + ' is inside monster boundry', 'moveInsideMonsterBoundry');
			return resolve('Inside monster boundry');
		}

		impure.timePrefix(this.id + ` is outside monster boundry, smart moving to ${JSON.stringify(monsterSpot)}`, 'moveInsideMonsterBoundry');

		const moveToSpot = () => this.smartMove(monsterSpot, {costs: {transport: 9999999, 'town': 9999999}});
		await runPromiseUntilSuccess(moveToSpot, errorHandler);

		impure.timePrefix( this.id + ' arrived at monster spot', 'moveInsideMonsterBoundry' );
		resolve('Arrived at monster spot');

	} );

}
