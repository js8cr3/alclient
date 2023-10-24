import { errorHandler } from "../library/errorHandler.js"
import { LocalStorage } from "../LocalStorage.js"

export async function depositItemsToBank(itemNameArray) {

	if(!this.ready) throw new Error('Character not ready');
	if(this.map !== 'bank') throw new Error('Not in bank');
	if(this.rip) throw new Error('Character dead');

	LocalStorage.currentUpgrade = undefined;

    for(let i = 0; i < this.items.length; i++) {

        const item = this.items[i];
        if(!item) continue;

        for(const itemName of itemNameArray) {

            if(item.name !== itemName) continue;

			while(this.ready) {
				await this.depositItem(i).catch(errorHandler);
				if(!this.items[i]) break; 
				await new Promise( r => setTimeout(r, 500) );
			}

            break;

        }

    }   

}
