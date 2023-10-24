import * as utils from "../library/utils.js"
import * as impure from "../library/impure.js"
import date from 'date-and-time'
import { Chalk } from "chalk"
const chalk = new Chalk({level: 3});

/*

events logged:
	combined damage	
	character defeat
	monster kills by character	
	gold drop from monsters
	item drop from monsters
	receiving party invite
	joining party
	party member leaving
	upgrade results
	selling items to vendors
	receiving gold from players
	sending gold to players
	receiving items from players
	sending items to players
	buying items from vendors

*/

export default function gameMessages() {

	const targetHistory = new Map();
	this.partyLength = 0;

	this.socket.on('action', handleActionData);
	this.socket.on('death', handleDeathData);
	this.socket.on('hit', handleHitData);
	this.socket.on('chest_opened', handleChestOpenData);
	this.socket.on('invite', handleInviteData);
	this.socket.on('party_update', handlePartyUpdateData);
	this.socket.on('player', handlePlayerData)
	this.socket.on('game_response', handleGameResponseData)

	const character = this;

	function handleActionData(data) {
		
		// records every monster the character attacked on 
		// the 'targetHistory' map 
		if(!data.attacker) return;
		if(data.attacker !== character.name) return;
		const target = character.getEntityByID(data.target);
		if(!target) return;
		targetHistory.set(data.target, target.name);

	};

	function handleDeathData(data) {

		// removes monsters from the 'targetHistory' map on death
		if(!targetHistory.has(data.id)) return;
		setTimeout( () => {
			targetHistory.delete(data.id)
		}, 1000);	

	};

	function handleHitData(data) {

		// log combined damage
		if(data.stacked && data.id && data.id === character.id) {
			impure.timePrefix(character.id+' recieved combined damage', '', '#000');
		}

		// if attacked by monster, add monster to 'targetHistory' map
		if(data.id === character.name) {
			const attacker = character.getEntityByID(data.hid);
			if(attacker) targetHistory.set(attacker.id, attacker.name);
			// if hit data has 'kill' and data id is character name, log death
			if(!data.kill) return;
			impure.timePrefix(character.id + ' defeated by ' + targetHistory.get(data.hid), '', '#702500');
		}

		// log when monsters are killed by character
		if(data.hid !== character.name) return;
		if(!data.kill) return;
		const monsterName = targetHistory.get(data.id);
		impure.timePrefix(`${character.name} killed ${utils.aOrAn(monsterName)} ${monsterName}`);

	};

	function handleChestOpenData(data) {

		if(data?.gold && data?.opener === character.name) {

			// log gold drop
			let goldMessage = data.gold+' gold';
			if(character.partyLength) goldMessage += ' * ' + character.partyLength;  
			impure.timePrefix(goldMessage, '', '#FF0');	

			// log item drop
			if(!data.items) return;
			if(data.items.length === 0) return;
			data.items.forEach( (item, index) => {
				impure.timePrefix(`${data.items[index].looter} got a ${data.items[index].name}`, '', '#0FF');
			} );

		}

	};

	function handleInviteData(data) {
		// log party invite
		impure.timePrefix(`${data.name} invited ${character.name} to their party`);	
	} 


	function handlePartyUpdateData(data) {

		if(data.party) character.partyLength = Object.keys(data.party).length;
		if(data.message) {

			const regex = new RegExp('^'+character.id);

			// log party member joining
			if(data.message.match(regex)) {
				impure.timePrefix(data.message, '', '#6020c0')
			};

			// log party member leaving
			if(data.leave === 1) {
				impure.timePrefix(data.message, '', '#654a25')
			};

		}

	};

	function handlePlayerData(data) {

		// log upgrade results

		const logBasedOnResponse = response => {
			switch(response) {
				case 'upgrade_success':
					impure.timePrefix('Item upgrade succeeded', '', '#fff');
					break;
				case 'upgrade_fail':
					impure.timePrefix('Item upgrade failed', '', '#f00');
					break;
				case 'compound_success':
					impure.timePrefix('Item combination succeeded', '', '#fff');
					break;
				case 'upgrade_fail':
					impure.timePrefix('Item combination failed', '', '#fff');
			}
		}

		if(!data.hitchhikers) return;
		for(const [hitchhikerEvent, hitchhikerData] of data.hitchhikers) {
			if(hitchhikerEvent === 'game_response' && typeof hitchhikerData === 'object') {
				logBasedOnResponse(hitchhikerData.response);
			}
		}

	};

	function handleGameResponseData(data) {

		switch(data.response) {

			case 'gold_received':

				// log sell to vendor events
				if(data.place === 'sell') {
					impure.timePrefix(`${character.name} sold ${data.item.name}+${ typeof data.item.level !== 'undefined' ? data.item.level : '' }${ data.item.q > 1 ? `(x${data.item.q})` : '' } for ${data.gold} gold`, '', '#777');
					break;
				};

				// log receiving gold from players
				if(data.name) {
					impure.timePrefix(`${character.name} received ${data.gold} gold from ${data.name}`, '', '#FF0');
					break;
				}

			case 'gold_sent':

				// log sending gold to players	
				impure.timePrefix(`${character.name} sent ${data.gold} gold to ${data.name}`, '', '#FF0');
				break;

			case 'item_received':

				// log receiving items from players
				impure.timePrefix(`${character.name} received ${data.item}${ data.q > 1 ? `(x${data.q})` : '' } from ${data.name}`, '', '#6495ed');
				break;

			case 'item_sent':

				// log sending items to players
				impure.timePrefix(`${character.name} sent ${data.item}${ data.q > 1 ? `(x${data.q})` : '' } to ${data.name}`, '', '#6495ed');
				break;

			case 'buy_success':

				// log buying items from vendors
				impure.timePrefix(`${character.name} brought ${data.name}${ data.q > 1 ? `(x${data.q})` : '' } with ${data.cost} gold`, '', '#777');
				break;

		}

	};

}
