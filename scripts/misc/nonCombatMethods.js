import * as utils from "../library/utils.js"
import * as impure from "../library/impure.js"
import { errorHandler } from "../library/errorHandler.js"

export function sendLootToMerchant(merchantName, itemBlacklist) {

	if(!this.ready) return;

	const merchant = this.getPlayerByName(merchantName);
	if(!merchant) return;

	if(utils.distance(this,merchant) > 600) return;

	if( this.gold ) this.sendGold(merchantName, this.gold).catch(errorHandler);

	this.items.forEach( (item, index) => {

		if(!item) return;

		let isBlacklisted = false;
		for(const listItem of itemBlacklist) {
			if(listItem === item.name) {
				isBlacklisted = true;
				break;
			}
		}
		if(isBlacklisted) return;

		this.sendItem(merchantName, index, item.q).catch(errorHandler);

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
	.then( () => impure.timePrefix(this.name + ' requested: ' + JSON.stringify(requestConsumablesCM.consumablesList), 'requestConsumables') )
	.catch(errorHandler);

};
