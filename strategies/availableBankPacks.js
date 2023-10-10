export function availableBankPacks() {

	if(this.map !== 'bank') throw new Error('Not in bank');
	if(!this.ready) throw new Error('Character not ready');

    return new Promise( async resolve => {
    
        for (let i = 0; i < 20; i++) {
            if (this.bank) break
            await new Promise(resolve => setTimeout(resolve, 250))
        }

        const bank = {}; 

        for (let packNum = 0; packNum <= 7; packNum++) {
            const packName = `items${packNum}`;
            const pack = this.bank[packName];
            if(!pack) continue;
            bank[packName] = pack;
        }

        resolve(bank);

    } ) 

}
