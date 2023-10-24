import { errorHandler } from "../library/errorHandler.js"

export async function useHPOrMP(hpSlot, mpSlot, hpMultiplier, mpMultiplier) {

	let potionUsed = false;

	if( this.isOnCooldown('use_hp') ) return;
	if( this.mp < this.max_mp * mpMultiplier ) {
		if(this.items[mpSlot].q <= 99) return;
		await this.useMPPot(mpSlot)
		.then( () => potionUsed = true )
		.catch( errorHandler ); 
	}

	if(potionUsed) return;

	if( this.hp < this.max_hp * hpMultiplier ) {
		if(this.items[hpSlot].q <= 99) return;
		this.useHPPot(hpSlot)
		.catch( errorHandler ); 
	}

}
