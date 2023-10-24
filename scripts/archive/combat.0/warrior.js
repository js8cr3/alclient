export default function warriorCombatLoop() {
	
	if(!this.ready) return;

	this.useHPOrMP(0, 1, 0.8, 0.8);
	this.loot();

	if(this.rip) return;

	let target = this.getTargetEntity();
	if(!target) target = this.getEntity( { targetingPlayer: 'Stool' } ); 
	if(!target) return;

	this.attackTargetOrMove(target, 0.5);

} 
