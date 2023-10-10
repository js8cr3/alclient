import * as impure from "../library/impure.js"
import * as utils from "../library/utils.js"

export function combatantOnCM(merchantName, consumablesNeeded, sendLootBlacklist) {

	this.socket.on('cm', handleCMData);

	const character = this;

	function handleCMData(CMData) {

		if(CMData.name !== merchantName) return;

		let message = CMData.message;
		if( !utils.stringIsJSON(message) ) return;
		message = JSON.parse(message);

		if(message.routine) {
			character.requestConsumables(merchantName, consumablesNeeded);
			character.sendLootToMerchant(merchantName, sendLootBlacklist);
		}

		// unequip slot and send unequipped item to cm sender
		if(message.unequip /* equipment slot to unequip */) {

			const equipmentOnSlot = character.slots[message.unequip];

			const unequipAndSendBack = async slot => {

				await character.unequip(slot).catch(console.error);
				for(let i = 0; i < character.items.length; i++) {
					const item = character.items[i];
					if(!item) continue;
					if(item.name !== equipmentOnSlot.name) continue;
					if(item.level !== equipmentOnSlot.level) continue;
					character.sendItem(merchantName, i).catch(console.error);
					break;
				}

			}

			if(equipmentOnSlot) {
				unequipAndSendBack(message.unequip);
			} else { 
				impure.timePrefix('Nothing to unequip on slot ' + message.unequip, combatantOnCM.name);	
			};

		}

	}	

};

export function merchantOnCM(partyList) {
	
	this.socket.on('cm', async CMData => {

		// check if sender is from party
		let fromParty = false;
		for(let i = 0; i < partyList.length; i++) {
			if(CMData.name !== partyList[i]) continue;
			fromParty = true;
			break;
		}

		if(!fromParty) return;

		const message = JSON.parse(CMData.message);
		const list = message.consumablesList;
		if(!list) return;

		// send items that are in consumablesList
		for(let i = 0; i < this.items.length; i++) {

			const item = this.items[i];
			if(!item) continue;
			for(const slot of Object.keys(list)) {

				if(slot !== item.name) continue;
				if(item.q <= 9) break;
				let availableQ = Math.max(0, item.q - 9); // make sure there are more than 99 units available after sending
				availableQ /= 3; // split down availableQ so that if item.q updates and availableQ no longer reflects item.q, the character won't send too many items
				const sendQ = list[slot] <= availableQ ? list[slot] : availableQ; // if amount requested is less than amount available, send amount requested, otherwise, send amount available 
				if(sendQ === 0) break;
				this.sendItem(CMData.name, i, sendQ).catch(console.error);
				list[slot] -= sendQ;
				break;

			}

		};

	});
	
};
