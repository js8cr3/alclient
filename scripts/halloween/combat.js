import * as impure from "../library/impure.js"
import * as utils from "../library/utils.js"
import { LocalStorage } from "../LocalStorage.js"
import { errorHandler } from "../library/errorHandler.js"
import { Pathfinder } from '../../node_modules/alclient/build/Pathfinder.js'

export function combat(characterNamesByClass) {

	const character = this;

	if(character.rip) return;
	if(!character.ready) return;

	const resetScareCountdown = () => {
		if(LocalStorage.scareCountdown) clearTimeout(LocalStorage.scareCountdown);
		impure.timePrefix(character.name + ' attack mode disabled', combat.name);
		LocalStorage.attackMode = false;
		LocalStorage.scareCountdown = setTimeout( () => {
			LocalStorage.attackMode = true;
			impure.timePrefix(character.name + ' attack mode re-enabled', combat.name);
		}, 10000 );
	}

	if(character.mp > 300 && character.targets && character.canUse('scare')) {
		character.scare().catch(errorHandler);
		resetScareCountdown();
	}

	if(character.ctype === 'mage') {
		const rogue = character.getPlayerByName(characterNamesByClass.rogue);
		if( 
			rogue &&  
			character.canUse('energize') &&  
			character.mp > character.max_mp * 0.5 
		) {
			if(utils.distance(character, rogue) > character.range * 0.9) {
				if(!character.moving) character.move(
					character.x+(rogue.x-character.x)/5,
					character.y+(rogue.y-character.y)/5
				).catch(errorHandler);
			} else {
				character.energize(characterNamesByClass.rogue, 1).catch(errorHandler);
			}
		};
	}

	if(character.ctype === 'warrior') {
		if( 
			character.canUse('warcry') &&  
			character.mp > character.max_mp * 0.5 
		) character.warcry().catch(errorHandler);
	}

	if(character.ctype === 'rogue') {
		const mage = character.getPlayerByName(characterNamesByClass.mage);
		if(mage) {
			if(character.canUse('invis')) character.invis().catch(errorHandler);
		} else {
			if(character.s.invis) character.stopInvis();
		};
	}


	let target = character.getTargetEntity();
	if(!target) target = character.getEntity({type:'mrpumpkin'});
	if(!target) target = character.getEntity({type:'mrgreen'});
	
	if(!target) return;
	
	if(target) character.target = target.id;
	
	if(character.mp < 200) return;
	if(!LocalStorage.attackMode) return;
    if(utils.distance(character, target) >= character.range) return;

	if( 
		target.target && 
		character.canUse('attack')
	) character.basicAttack(target.id).catch(errorHandler);

}

export function combatMovement() {

	const character = this;
	
	if(!character.ready) return;

	character.useHPOrMP(0, 1, 0.8, 0.8);
	character.loot();

	if(character.rip) return;

	const target = character.getTargetEntity();
	if(!target) return;

    if(utils.distance(character, target) >= character.range * 0.8) {
    	const pathClear = Pathfinder.canWalkPath(character, target);
        if(!pathClear) {
            if(!LocalStorage.isSmartmoving) {
                LocalStorage.isSmartmoving = true;
                character.smartMove({ x: target.x, y: target.y })
                .then( () => LocalStorage.isSmartmoving = false )
                .catch( ()  => LocalStorage.isSmartmoving = false );
            } else {
                return;
            }
		} else {
			character.move(
				character.x+(target.x-character.x)/5,
				character.y+(target.y-character.y)/5
			).catch(()=>{});
		}
    }   

}
