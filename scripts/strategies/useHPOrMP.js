import { errorHandler } from "../library/errorHandler.js"

let potionUsedInPastSecond;

export async function useHPOrMP(hpSlot, mpSlot, hpMultiplier, mpMultiplier) {

	for(const arg of [hpSlot, mpSlot, hpMultiplier, mpMultiplier]) {
		if(typeof arg === 'undefined') throw new Error('useHPOrMP arg missing');
	}

	if(potionUsedInPastSecond) return;
	let potionUsed = false;

	if( this.isOnCooldown('use_hp') ) return;
	if( this.mp < this.max_mp * mpMultiplier ) {
		if(this.items[mpSlot].q <= 99) return;
		await this.useMPPot(mpSlot)
		.then( () => potionUsed = true )
		.catch( errorHandler ); 
	}

	if( !potionUsed && this.hp < this.max_hp * hpMultiplier ) {
		if(this.items[hpSlot].q <= 99) return;
		this.useHPPot(hpSlot)
		.then( () => potionUsed = true )
		.catch( errorHandler ); 
	}

	if(potionUsed) {
		potionUsedInPastSecond = true;
		setTimeout( () => potionUsedInPastSecond = false, 999 );
	};

}
