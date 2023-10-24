import chalk from 'chalk'
import * as impure from "./library/impure.js"

const mtype = 'scorpion'
const monsterBoundry = [1485,-390,1670,54]
const monsterSpot = {map: 'main', x: 1550, y: -200};
const merchantName = 'Bench';
const partyList = ['Desk', 'Stool', 'Shelf'];
const consumablesNeeded = {'hpot1': 9999, 'mpot0': 9999}; 
const sendLootBlacklist = ['tracker','hpot1', 'mpot0'];
const selectEquipementList = ctype => {
	switch(ctype) {
		case 'mage': 
			return ['wbook0', 'staff', 'coat', 'ringsj', 'wcap', 'shoes', 'pants', 'gloves', 'intearring', 'intamulet'];
		case 'warrior': 
			return ['blade', 'coat', 'ringsj', 'wcap', 'shoes', 'pants', 'gloves', 'stramulet', 'strearring'];
		case 'priest': 
			return ['wbook0', 'staff', 'coat', 'ringsj', 'wcap', 'shoes', 'pants', 'gloves', 'intearring', 'intamulet'];
	}
};

export default async function startup() {

    for(let i = 0; !this.ready; i++) {
        await new Promise(r=>setTimeout(r,500));
        if(i > 99) throw new Error('Character failed to load');
    }   

	const callStartupMethods = () => {
		this.gameMessages();
		this.formParty(...partyList);
		this.combatantOnCM(merchantName, consumablesNeeded, sendLootBlacklist);
		this.onReceivingEquipment(merchantName, selectEquipementList(this.ctype)); 
		this.updateDatabase();
		this.disperseOnCombinedDamage()
	};

	callStartupMethods();

	const handleDeath = async () => {
		impure.functionMessage( this.id + ' died, respawning', 'startup' );
		await new Promise(r=>setTimeout(r,15000));
		await this.respawn();
		impure.functionMessage( this.id + ' respawned', 'startup' );
	}

	let combatLoop;

	while(this.ready) {

		await new Promise(r=>setTimeout(r,1000));

		try {

			if(this.rip) await handleDeath();
			await this.moveInsideMonsterBoundary(monsterBoundry, monsterSpot);
			impure.functionMessage( this.id + ' starts combat', 'startup' );
			combatLoop = setInterval( () => this.combat(mtype), 50 );

			while(this.ready) {
				if(this.rip) throw new Error('Character dead')
				await new Promise(r=>setTimeout(r,1000));
			}

		} catch(error) {

			clearInterval(combatLoop);
			console.debug(error);

		}

	}

}
