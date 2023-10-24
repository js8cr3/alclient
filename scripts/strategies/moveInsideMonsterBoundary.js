import * as impure from '../library/impure.js'

export function moveInsideMonsterBoundary([x1, y1, x2, y2], monsterSpot) {

	let left = x1, right = x2, up = y1, down = y2;
	if(x1 > x2) {
		left = x2; right = x1;
	}
	if(y1 > y2) {
		down = y1; up = y2;
	}

	const atMonsterSpot = new Promise( async (resolve, reject) => {

		if(	this.x > left && this.x < right && 
			this.y > up && this.y < down
		) {
			impure.functionMessage(this.id + ' is inside monster boundry', 'moveInsideMonsterBoundry');
			return resolve('Inside monster boundry');
		}

		impure.functionMessage(this.id + ` is outside monster boundry, smart moving to ${JSON.stringify(monsterSpot)}`, 'moveInsideMonsterBoundry');

	    await this.smartMove(monsterSpot, {costs: {transport: 9999999, 'town': 9999999}});
		impure.functionMessage( this.id + ' arrived at monster spot', 'moveInsideMonsterBoundry' );
		resolve('Arrived at monster spot');

	} );

	return atMonsterSpot;

}
