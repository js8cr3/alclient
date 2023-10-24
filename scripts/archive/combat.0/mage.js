export default function mageCombatLoop() {
	
	if(!this.ready) return;

	this.useHPOrMP(0, 1, 0.8, 0.8);
	this.loot();

	if(this.rip) return;

	let target = this.getTargetEntity();
	if(!target) target = this.getEntity( { targetingPlayer: 'Stool' } );
	if(!target) return;

	if(
		this.getPlayerByName('Shelf') && 
		this.canUse('energize') && 
		this.mp > this.max_mp * 0.5
	) {
		this.energize('Shelf', 1).catch(console.error);
	}
	this.attackTargetOrMove(target, 0.2);

} 
