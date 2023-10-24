export function rogueCombatLoop(mtype) {
	
	if(!this.ready) return;

	this.useHPOrMP(0, 1, 0.8, 0.8);
	this.loot();

	if(this.rip) return;

	let target = this.getTargetEntity();
	if(!target) target = this.getNearestMonsterInsideBoundary([-396,-594,8,-328]);
	if(!target) return;

	this.target = target.id;
	this.attackTargetOrMove(target, 0.2);

} 
