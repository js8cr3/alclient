import chalk from 'chalk'
import * as utils from "./library/utils.js"
import { assignMethods } from "./library/assignMethods.js"
import { assignHalloweenMethods } from "./halloween/assignHalloweenMethods.js"
import { LocalStorage } from "./LocalStorage.js"

const partyList = ["Desk", "Roof", "Shelf"];
const characterNamesByClass = {
	"mage": "Desk",
	"rogue": "Roof",
	"warrior": "Shelf",
	"merchant": "Bench"
}
const consumablesNeeded = {'hpot1': 9999, 'mpot0': 9999}; 
const sendLootBlacklist = ['tracker','hpot1', 'mpot0'];
const selectEquipementList = ctype => {
	switch(ctype) {
		case 'mage': 
			return ['intbelt', 'wbook0', 'staff', 'coat', 'intring', 'mmhat', 'shoes', 'pants', 'gloves', 'intearring', 'intamulet'];
		case 'warrior': 
			return ['strbelt', 'blade', 'coat', 'strring', 'wcap', 'shoes', 'pants', 'gloves', 'stramulet', 'strearring'];
		case 'priest': 
			return ['wbook0', 'staff', 'coat', 'intring', 'wcap', 'shoes', 'pants', 'gloves', 'intearring', 'intamulet'];
		case 'rogue': 
			return ['firestars', 'coat', 'dexring', 'wcap', 'shoes', 'pants', 'gloves', 'dexearring', 'dexamulet', 'dexbelt'];
	}
};

export default async function startup() {

	assignMethods(this);
	assignHalloweenMethods(this);

	const callStartupMethods = () => {
		this.gameMessages();
		this.formParty(...partyList);
		this.combatantOnCM(characterNamesByClass.merchant, consumablesNeeded, sendLootBlacklist);
		this.onReceivingEquipment(characterNamesByClass.merchant, selectEquipementList(this.ctype)); 
		this.updateDatabase();
		this.disperseOnCombinedDamage();
		this.handleMagiportInvite(characterNamesByClass.mage, undefined /*() => LocalStorage.combatState = 'ready'*/ );
	};

	callStartupMethods();

	for(let i = 0; !this.ready; i++) {
		await new Promise( r => setTimeout(r, 1000) );
		if( i > 99 ) throw new Error("Character failed to load");
	}
	
	await this.combatMain(characterNamesByClass);

}
