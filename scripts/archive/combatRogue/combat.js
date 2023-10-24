import { getNearestMonsterInsideBoundary, getAggressiveMonster } from './adventurelandUtils.js';
import { distance } from '../library/utils.js'
import { Pathfinder } from '../../node_modules/alclient/build/Pathfinder.js'
import { errorHandler } from '../library/errorHandler.js'

export { combatMisc, mage, priest, warrior, warriorMove };

const moveOpt = {disableErrorLogs: true,disableSafetyCheck: true};

function combatMisc() {

	if(!this.ready) return;

    this.useHPOrMP(0, 1, 0.8, 0.8);
    this.loot();

	const target = this.getTargetEntity();
	
	if(
		this.slots.orb && 
		this.slots.orb.name === 'jacko' && 
		!this.isOnCooldown('scare')	
	) {
		let useScare = false;
		if(this.targets >= 2) useScare = true;
		if(!target && this.targets >= 1) {
			useScare = true;
		}
		if(target?.target && target.target !== this.name && this.targets >= 1) {
			useScare = true;
		}
		if(useScare) this.scare().catch(errorHandler);
	}
}

function priest(boundary) {

	if(!this.ready) return;

	this.combatMisc();

	if(!this.isOnCooldown('darkblessing') && this.mp > 1500) this.darkBlessing().catch(errorHandler)
	
	var target= this.getTargetEntity();
	if(!target)
	{
		target=this.getNearestMonsterInsideBoundary(boundary);
		if(target) this.target = target.id;
		else
		{return}
	}
	
	if(distance(this, target) > this.range)
	{
		if(!target.target) this.target = undefined;
		if(target.target && target.target !== this.name) this.target = undefined;
		return
	}

	if(this.isOnCooldown('attack')) return;
	if(this.hp < this.max_hp * 0.6) {
		this.healSkill(this.name).catch(errorHandler);
		return;
	}

	if(
		target.target &&
		target.target !== this.name && 
		!this.isOnCooldown('absorb')
	) this.absorbSins(target.target).catch(errorHandler);

	if(this.mp > 700 && !this.isOnCooldown('curse')) this.curse(target.id).catch(errorHandler);
	this.basicAttack(target.id).catch(errorHandler);

}

function mage(priestName) {

	if(!this.ready) return;

	this.combatMisc();	

	var target= this.getTargetEntity();
	const priest = this.getPlayerByName(priestName);
	if(!priest) return;
	if(!target)
	{
		target = this.getEntityByID(priest.target)
		if(target) this.target = target.id;
		if(!target) return;
	}
	
	if(distance(this, target) > this.range) return;
	if(!this.isOnCooldown('attack')) this.basicAttack(target.id).catch(errorHandler);
		
}

function warrior(priestName) {

	if(!this.ready) return;

	this.combatMisc();

	var target = this.getTargetEntity();
	const priest = this.getPlayerByName(priestName);
	if(!priest) return;

	const tauntStrategy = () => {
		if(this.isOnCooldown('scare')) return;
		if(priest.targets <= 1) return;
		const excludeList = [];
		if(target) excludeList.push(target.id)
		const aggro = this.getAggressiveMonster(['Bench', priest.name], excludeList);
		if(aggro && !this.isOnCooldown('taunt')) this.taunt(aggro.id).catch(errorHandler);
	}

	tauntStrategy();
	if(!this.isOnCooldown('warcry')) this.warcry().catch(errorHandler);
	
	if(!target)
	{
		target= this.getEntityByID(priest.target)
		if(target) this.target = target.id;
		if(!target) return;
	}
	
	const distanceToTarget = distance(this, target);
	if(distanceToTarget > 200 && !this.isOnCooldown('charge')) this.charge().catch(errorHandler)
	if(distanceToTarget > this.range) return;
	if(!this.isOnCooldown('attack')) this.basicAttack(target.id).catch(errorHandler);
		
}

function warriorMove(priestName) {

	if(!this.ready) return;

	var target = this.getTargetEntity();
	if(!target) {
		const priest = this.getPlayerByName(priestName);
		if(!priest) return;
		this.move(priest.x, priest.y,moveOpt)
		.catch(errorHandler);

		return;
	}
		
	if(distance(this, target) > this.range * 0.2) {
		const pathClear = Pathfinder.canWalkPath(this, target);
		if(!pathClear) {
			if(!this.isSmartmoving) {
				this.isSmartmoving = true;
				this.smartMove({ x: target.x, y: target.y })
				.then( () => this.isSmartmoving = false )
				.catch( error => this.isSmartmoving = false );
			} else {
				return;
			}
		} else {
			this.move( 
				this.x+(target.x-this.x)/2, 
				this.y+(target.y-this.y)/2,
				moveOpt
			).catch(errorHandler);
		}
	};
		
}

