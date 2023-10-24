import { errorHandler } from "../library/errorHandler.js"

export default async function handleLoot(itemsToBuy, itemsToSell) {

	if(!this.ready) throw new Error('Character not ready');

	const checkSlotForBuying = (item) => {

		return new Promise( async resolve => {

			for( const listItemName of Object.keys(itemsToBuy) ) {

				const qNeeded = itemsToBuy[listItemName];
				if(item.name !== listItemName) continue;
				if(item.q >= qNeeded) break;

				const itemCost = this.G.items[item.name].g;
				const amountToBuy = Math.min( qNeeded - item.q, Math.floor(this.gold / itemCost) );
				if(!amountToBuy) break;

				await this.buy( item.name, amountToBuy ).catch(errorHandler);

				return resolve('Buy success');

			};

			resolve('Nothing to buy');

		} );

	};

	const checkSlotForSelling = (item, index) => {
		for( const listItem of itemsToSell ) {
			if(item.name !== listItem) continue;
			if(item.level >= 1) continue;
			return this.sell(index, item.q).catch(errorHandler);
		};
	};

    for(let i = 0; i < this.items.length; i++) {
		if(!this.items[i]) continue;
        const buyStatus = await checkSlotForBuying(this.items[i]);
        if( buyStatus ===  'Buy success' ) continue;
        await checkSlotForSelling(this.items[i], i);
    };

}
