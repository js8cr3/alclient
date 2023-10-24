import * as impure from "../library/impure.js"
import chalk from 'chalk'

let targetToHeal;

export default function PriestCombatLoop(mtype) {
	
	if(!this.ready) return;

	this.useHPOrMP(0, 1, 0.8, 0.8);
	this.loot();

	if(this.rip) return;

	if( healPartyMembers(this) ) return;

	const target = this.findOrGetTarget(mtype);
	if(!target) return;

	this.attackTargetOrMove(target, 0.2);
	if(
		this.canUse('curse') && 
		this.mp > this.max_mp * 0.5 &&
		target.hp > 5000
	) {

		this.curse(target.id).catch( () => {} );
	}

} 

function healPartyMembers(priest) {

	const partyMembers = [priest.id, 'Floor', 'Shelf'];
	const HPRatio = 0.7;

	partyMembers.forEach( memberName => {
		if(targetToHeal) return;
		let member;
		if(memberName === priest.id) {
			member = priest;
		} else {
			member = priest.getPlayerByName(memberName);
			if(!member) return;
		};
		if(member.hp < member.max_hp * HPRatio) {
			targetToHeal = member;
		}
	} );

	if(!targetToHeal) return false;

	if( priest.moveTowardsTargetIfNotInRange(targetToHeal, 0.2) ) return true;

	if(priest.isOnCooldown('heal')) return true;
	if( !priest.hasEnoughHPOrMP('mp', 0.5) ) return true;
	priest.healSkill(targetToHeal.id).catch(console.error);
	targetToHeal = undefined;
	return true;

}
