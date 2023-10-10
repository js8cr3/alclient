import * as impure from "../library/impure.js"

export default async function autoUpgrade(upgradeList, minGold, restSpot) {

	if(!this.ready) throw new Error('Character not ready');
	if(this.rip) throw new Error('Character dead');

	const character = this;

	const upgradeProcess = async (resolve, reject) => {

		// possible fulfillment values:
			// resolve('No more in inventory to upgrade')
			// resolve('Upgrade finished')
			// reject(upgradeError)
			// reject('Upgrade timeout')

		const listItem = upgradeList[this.currentUpgrade];
		let currentUpgradeLocation = findItemUnderLevel(this.currentUpgrade, listItem.level);

		if(!currentUpgradeLocation) {
			// if buy value isn't a truthy, and there is no more of the type in inventory, set currentUpgrade to undefined and resolve
			if( !this.upgradeBuy ) {
				this.currentUpgrade = undefined;
				impure.functionMessage('No more in inventory to upgrade', autoUpgrade.name);
				return resolve('No more in inventory to upgrade');
			}
			// if buy value is true, and item of type not found, buy it
			await this.buy(this.currentUpgrade)
			.then( data => currentUpgradeLocation = data );
		};

		// buy scroll depending on grade

		const scrollType = upgradeScrollTypeNeeded(this.items[currentUpgradeLocation]);
		let scrollLocation = findItemUnderLevel(scrollType);

		if(!scrollLocation) {
			await this.buy(scrollType)
			.then( data => scrollLocation = data );
		}

		// check if there is any ongoing upgrades
		if(this.q.upgrade) {
			impure.functionMessage(`Waiting for previous upgrade to finish (${this.q.upgrade.len}ms)`, autoUpgrade.name, '#f00');
			await new Promise( r => setTimeout(r, this.q.upgrade.len + 2000) );
		}

		// upgrade

		if(this.items[currentUpgradeLocation].level >= 4) {
			await this.massProduction().catch(console.error);
		}

		impure.functionMessage(`Upgrading ${this.items[currentUpgradeLocation].name}+${this.items[currentUpgradeLocation].level}`, autoUpgrade.name, '#777');
		await this.upgrade(currentUpgradeLocation, scrollLocation).catch(upgradeErrorHandler);

		return resolve('Upgrade finished');
		
		function upgradeErrorHandler(error) {
			const timeoutRegex = /^Error: Failed to upgrade \(Timeout: .*ms\)$/;
			if( error.toString().match(timeoutRegex) ) {
				impure.functionMessage(error.toString(), autoUpgrade.name, '#F00');
				return reject('Upgrade timeout');
			}
			reject(error);
		}

	}

	const compoundProcess = async (resolve, reject) => {

		// check if there is enough items at certain levels

		const listItem = upgradeList[this.currentUpgrade];
		let currentCompoundLocationArray;
		let compoundLevel;

		for(let level = 0; level < listItem.level; level++) {
			const locationArray = findItemsAtLevel(this.currentUpgrade, level);
			if(locationArray.length < 3) continue;
			currentCompoundLocationArray = locationArray;
			compoundLevel = level;
			break;
		}

		// if there isn't enough items to compound, set this.currentUpgrade to undefined and resolve

		if(typeof compoundLevel === 'undefined') {
			this.currentUpgrade = undefined;
			impure.functionMessage('No more in inventory to compound', autoUpgrade.name);
			return resolve('No more in inventory to compound');
		}

		// set up data for later use
		const sampleSlot = currentCompoundLocationArray[0];
		currentCompoundLocationArray.splice(3);

		// buy scroll depending on grade

		const scrollType = compoundScrollTypeNeeded(this.items[ sampleSlot ]);
		let scrollLocation = this.locateItem(scrollType);
		if(!scrollLocation) {
			await this.buy(scrollType)
			.then( data => scrollLocation = data )
		}

		// check if there is any ongoing compounds
		if(this.q.compound) {
			impure.functionMessage(`Waiting for previous compound to finish (${this.q.compound.len}ms)`, autoUpgrade.name, '#f00');
			await new Promise( r => setTimeout(r, this.q.compound.len + 2000) );
		}

		// compound

		const compoundErrorHandler = error => {
			const timeoutRegex = /^Error: Failed to compound \(Timeout: .*ms\)$/;
			if( error.toString().match(timeoutRegex) ) {
				impure.functionMessage(error.toString(), autoUpgrade.name, '#F00');
				return reject('Compound timeout');
			}
			reject(error);
		}

		impure.functionMessage(`Compounding ${this.items[sampleSlot].name}+${this.items[sampleSlot].level}`, autoUpgrade.name, '#777');
		await this.massProduction().catch(console.error);
		await this.compound(...currentCompoundLocationArray, scrollLocation)
		.catch(compoundErrorHandler);

		resolve('Compound finished');

	}

	// return if certain conditions are met
	// possible results: 
		// 'Not enough gold'
		// await this.bankItems()
			// 'Finished all upgrades'
			// 'Banked items'		
		// await new Promise(upgradeProcess)
			// resolve('No more in inventory to upgrade')
			// resolve('Upgrade finished')
			// reject('Upgrade timeout')
			// unknown error
		// await new Promise(compountProcess)
			// resolve('No more in inventory to compound')
			// resolve('Comound finished')
			// reject('Compound timeout')
			// unknown error

	if(this.gold < minGold) {
		impure.functionMessage(`Current gold (${this.gold}) below threshold (${minGold})`, autoUpgrade.name);
		return 'Not enough gold';
	};

	// if there is an item that has reached sufficient level in inventory while this.upgradeBuy is true, set this.upgradeBuy to false
	// this is to prevent limitlessly upgrading vendor equipment

	if(
		this.currentUpgrade && 
		this.upgradeBuy && 
		findItemAtOrAboveLevel(this.currentUpgrade, upgradeList[this.currentUpgrade].level)
	) {
		impure.functionMessage(`${this.currentUpgrade} reached target level (${upgradeList[this.currentUpgrade].level})`, autoUpgrade.name);
		this.upgradeBuy = false;
	}

	// if this.currentUpgrade is undefined, check bank to determine new this.currentUpgrade

	if(!this.currentUpgrade) {
		await this.closeMerchantStand()
		impure.functionMessage(`No target to upgrade, checking bank to decide target`, autoUpgrade.name);
		await this.smartMove('bank')
		const bankResult = await this.bankItems(upgradeList, restSpot);
		await this.smartMove(restSpot);
		impure.functionMessage(bankResult, autoUpgrade.name);
		return bankResult;
	}

	// determine whether to upgrade or compound, and return the result of upgradeProcess() or compoundProcess()

	try { 

		await this.openMerchantStand();
		const upgradeTarget = this.G.items[this.currentUpgrade];
		if( upgradeTarget.upgrade ) {
			return await new Promise(upgradeProcess);
		} else if ( upgradeTarget.compound ) {
			return await new Promise(compoundProcess);
		}
		
		throw new Error('Can\'t upgrade or compound');

	} catch (error) {

		if( error === 'Upgrade timeout' | error === 'Compound timeout' ) {
			await new Promise( r => setTimeout(r, 10000) );
		}
			
		return error;

	}

	function findItemUnderLevel(name, targetLevel) {
		for(let i = 0; i < character.items.length; i++) {
			const item = character.items[i];
			if(!item) continue;
			if(item.name !== name) continue;
			if(targetLevel && item.level >= targetLevel) continue;
			return i;
		}
	}

	function upgradeScrollTypeNeeded(slot /* inventory slot */) {
		 if(character.G.items[slot.name].grades[0] === 0) throw new Error('Scroll type check unimplemented');
		if( slot.level < character.G.items[slot.name].grades[0] ) return 'scroll0';
		return 'scroll1';
	}

	function findItemsAtLevel(name, targetLevel) {
		let indexArray = [];
		for(let i = 0; i < character.items.length; i++) {
			const item = character.items[i];
			if(!item) continue;
			if(item.name !== name) continue;
			if(typeof targetLevel !== 'undefined' && item.level !== targetLevel) continue;
			indexArray.push(i);
		}
		return indexArray;
	}

	function compoundScrollTypeNeeded(slot /* inventory slot */) {
		if(character.G.items[slot.name].grades[0] === 0) throw new Error('Scroll type check unimplemented');
		if( slot.level < character.G.items[slot.name].grades[0] ) return 'cscroll0';
		return 'cscroll1';
	}

	function findItemAtLevel(name, targetLevel) {
        for(let i = 0; i < character.items.length; i++) {
           const item = character.items[i];
           if(!item) continue;
           if(item.name !== name) continue;
           if(targetLevel && item.level < targetLevel) continue;
           return i;
        }
	};


}
