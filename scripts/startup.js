import chalk from 'chalk'
import * as impure from "./library/impure.js"
import * as utils from "./library/utils.js"

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

	const callStartupMethods = () => {
		this.gameMessages();
		this.formParty(...partyList);
		this.combatantOnCM(merchantName, consumablesNeeded, sendLootBlacklist);
		this.onReceivingEquipment(merchantName, selectEquipementList(this.ctype)); 
		this.updateDatabase();
		this.disperseOnCombinedDamage( () => {
			this.move(this.x+utils.randomNum(-10,10), this.y+utils.randomNum(-10, 10))
			.catch( () => {} )
		} );
	};

	callStartupMethods();

	while(!this.ready) {
		await new Promise( r => setTimeout(r, 1000) );
	}
	
	this.combatMain();

}
