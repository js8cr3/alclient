import * as utils from "../library/utils.js"
import * as impure from "../library/impure.js"

export function sendLootToMerchant(merchantName, itemBlacklist) {

	if(!this.ready) return;

	const merchant = this.getPlayerByName(merchantName);
	if(!merchant) return;

	if(utils.distance(this,merchant) > 600) return;

	if( this.gold ) this.sendGold(merchantName, this.gold).catch(console.error);

	this.items.forEach( (item, index) => {
		if(!item) return;
		let isBlacklisted = false;
		for(const listItem of itemBlacklist) {
			if(listItem === item.name) {
				isBlacklisted = true;
				break;
			}
		}
		if(!isBlacklisted) this.sendItem(merchantName, index, item.q).catch(console.error);
	} );

}

export function requestConsumables(merchantName, consumableTypes) {

	// consumableTypes: {}

	if(!this.ready) return;

	const merchant = this.getPlayerByName(merchantName);
	if(!merchant) return;
	if( utils.distance(this, merchant) > 500) return;

	const requestConsumablesCM = {consumablesList: {}};
	const items = this.items
	Object.keys(consumableTypes).forEach( consumableType => {
		for(const item of items) {
			if(!item) continue;
			if(item.name === consumableType) {
				requestConsumablesCM.consumablesList[consumableType] = consumableTypes[consumableType] - item.q;
				break;
			};
		};
	} );
	
	this.sendCM([merchantName], requestConsumablesCM)
	.then( () => impure.functionMessage(this.name + ' requested: ' + JSON.stringify(requestConsumablesCM.consumablesList), 'requestConsumables') )
	.catch( error => impure.functionMessage(error.toString(), 'requestConsumables') );

};
