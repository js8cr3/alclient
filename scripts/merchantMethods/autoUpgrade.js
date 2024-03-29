import * as impure from "../library/impure.js"
import { errorHandler } from "../library/errorHandler.js"
import { LocalStorage } from "../LocalStorage.js"

/*
    autoUpgrade Looping: a loop that continues calling autoUpgrade() until autoUpgrade returns a value that signals to end the loop

		currentUpgrade: type of equipment to upgrade
		upgradeBuy: whether to buy equipment after running out


		if gold less than desired
			END UPGRADE LOOP
		if !LocalStorage.currentUpgrade
			determine new upgrade target
				if not enough space in inventory
					END UPGRADE LOOP
				per potential upgrade target
					if potential target exists in bank
						set currentUpgrade to potential target
						continue to next autoUpgrade iteration (which will start upgrading target)
					if potential target doesnt exist in bank
						if set to buy
							set currentUpgrade to potential target
							continue to next autoUpgrade iteration 
						if not set to buy
							continue looking for potential target
				if upgrade target not found
					END UPGRADE LOOP
		if currentUpgrade exists in inventory
			upgrade item
			continue to next autoUpgrade iteration 
		if currentUpgrade not exist in inventory
			if upgradeBuy is true
				buy, upgrade
				continue to next autoUpgrade iteration 
			if upgradeBuy is not true
				set currentUpgrade to undefined (so next iteration will determine new target)
				continue to next autoUpgrade iteration 
		if upgradeBuy is true, and theres equipment in inventory that reached target level
			upgradeBuy set to falsy
			continue to next autoUpgrade iteration 

*/

export default async function autoUpgrade(upgradeList, minGold, restSpot) {

	// possible return values: 
		// 'Not enough gold'						- END LOOP
		// await this.determineNewUpgradeTarget()
			// 'Finished all upgrades' 				- END LOOP
			// 'Not enough space in inventory'		- END LOOP
			// 'Found upgrade target'
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

	if(!this.ready) throw new Error('Character not ready');
	if(this.rip) throw new Error('Character dead');

	const character = this;

	const upgradeProcess = async (resolve, reject) => {

		const listItem = upgradeList[LocalStorage.currentUpgrade];
		let currentUpgradeLocation = findItemUnderLevel(LocalStorage.currentUpgrade, listItem.level);

		if(!currentUpgradeLocation) {
			// if LocalStorage.upgradeBuy isn't a truthy, and there is no more of the type in inventory, set currentUpgrade to undefined and resolve
			if( !LocalStorage.upgradeBuy ) {
				LocalStorage.currentUpgrade = undefined;
				impure.timePrefix('No more in inventory to upgrade', autoUpgrade.name);
				return resolve('No more in inventory to upgrade');
			}
			// if LocalStorage.upgradeBuy is true, and item of type not found, buy it
			await character.buy(LocalStorage.currentUpgrade)
			.then( data => currentUpgradeLocation = data )
			.catch(reject);
		};

		// buy scroll depending on grade

		const scrollType = upgradeScrollTypeNeeded(character.items[currentUpgradeLocation]);
		let scrollLocation = findItemUnderLevel(scrollType);

		if(!scrollLocation) {
			await character.buy(scrollType)
			.then( data => scrollLocation = data )
			.catch(reject);
		}

		// check if there is any ongoing upgrades
		if(character.q.upgrade) {
			impure.timePrefix(`Waiting for previous upgrade to finish (${character.q.upgrade.len}ms)`, autoUpgrade.name, '#f00');
			await new Promise( r => setTimeout(r, character.q.upgrade.len + 2000) );
		}

		// upgrade

		impure.timePrefix(`Upgrading ${character.items[currentUpgradeLocation].name}+${character.items[currentUpgradeLocation].level}`, autoUpgrade.name, '#777');
		
		if(character.items[currentUpgradeLocation].level >= 4) {
			await character.massProduction().catch(errorHandler);
		}
		await character.upgrade(currentUpgradeLocation, scrollLocation).catch(reject);

		return resolve('Upgrade finished');

	}

	const compoundProcess = async (resolve, reject) => {

		// check if there is enough items at certain levels

		const listItem = upgradeList[LocalStorage.currentUpgrade];
		let currentCompoundLocationArray;
		let compoundLevel;

		for(let level = 0; level < listItem.level; level++) {
			const locationArray = findItemsAtLevel(LocalStorage.currentUpgrade, level);
			if(locationArray.length < 3) continue;
			currentCompoundLocationArray = locationArray;
			compoundLevel = level;
			break;
		}

		// if there isn't enough items to compound, set this.currentUpgrade to undefined and resolve

		if(typeof compoundLevel === 'undefined') {
			LocalStorage.currentUpgrade = undefined;
			impure.timePrefix('No more in inventory to compound', autoUpgrade.name);
			return resolve('No more in inventory to compound');
		}

		// set up data for later use
		const sampleSlot = currentCompoundLocationArray[0];
		currentCompoundLocationArray.splice(3);

		// buy scroll depending on grade

		const scrollType = compoundScrollTypeNeeded(character.items[ sampleSlot ]);
		let scrollLocation = character.locateItem(scrollType);
		if(!scrollLocation) {
			await character.buy(scrollType)
			.then( data => scrollLocation = data )
			.catch(reject);
		}

		// check if there is any ongoing compounds
		if(character.q.compound) {
			impure.timePrefix(`Waiting for previous compound to finish (${character.q.compound.len}ms)`, autoUpgrade.name, '#f00');
			await new Promise( r => setTimeout(r, character.q.compound.len + 2000) );
		}

		// compound

		impure.timePrefix(`Compounding ${character.items[sampleSlot].name}+${character.items[sampleSlot].level}`, autoUpgrade.name, '#777');
		await character.massProduction().catch(errorHandler);
		await character.compound(...currentCompoundLocationArray, scrollLocation).catch(reject);

		resolve('Compound finished');

	}

	// if gold is less than desired, return
	if(character.gold < minGold) {
		impure.timePrefix(`Current gold (${this.gold}) below threshold (${minGold})`, autoUpgrade.name);
		return 'Not enough gold';
	};

	// if there is an item that has reached sufficient level in inventory while LocalStorage.upgradeBuy is true, set LocalStorage.upgradeBuy to false
	// this is to prevent overbuying vendor equipment

	if(
		LocalStorage.currentUpgrade && 
		LocalStorage.upgradeBuy && 
		findItemAtOrAboveLevel(LocalStorage.currentUpgrade, upgradeList[LocalStorage.currentUpgrade].level)
	) {
		impure.timePrefix(`${LocalStorage.currentUpgrade} reached target level (${upgradeList[LocalStorage.currentUpgrade].level})`, autoUpgrade.name);
		LocalStorage.upgradeBuy = false;
	}

	// if LocalStorage.currentUpgrade is undefined, check bank to determine new LocalStorage.currentUpgrade

	if(!LocalStorage.currentUpgrade) {
		await character.closeMerchantStand().catch(errorHandler)
		impure.timePrefix(`No target to upgrade, checking bank to decide target`, autoUpgrade.name);
		await character.smartMove('bank');
		const bankResult = await character.determineNewUpgradeTarget(upgradeList);
		await character.smartMove(restSpot);
		impure.timePrefix(bankResult, autoUpgrade.name);
		return bankResult;
	}

	// determine whether to upgrade or compound, and return the result of upgradeProcess() or compoundProcess()

	try { 

		await character.openMerchantStand();
		const upgradeTarget = character.G.items[LocalStorage.currentUpgrade];
		if( upgradeTarget.upgrade ) {
			return await new Promise(upgradeProcess);
		} else if ( upgradeTarget.compound ) {
			return await new Promise(compoundProcess);
		}
		
		throw new Error('Can\'t upgrade or compound');

	} catch (error) {

		const timeoutErrorList = [
			/^Error: Failed to compound\(Timeout: .*ms\)$/,
			/^Error: Failed to upgrade\(Timeout: .*ms\)$/
		];

		for(const regex of timeoutErrorList) {
			if( regex.test(error.toString()) ) {
				await new Promise( r => setTimeout(r, 10000) );
				break;
			}
		}
			
		throw error;

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
        if(character.G.items[slot.name].grades[0] === 0) {
            if( slot.level < character.G.items[slot.name].grades[1] ) return 'scroll1';
            return 'scroll2';
        };
        if( slot.level < character.G.items[slot.name].grades[0] ) return 'scroll0';
        if( slot.level < character.G.items[slot.name].grades[1] ) return 'scroll1';
        return 'scroll2';
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

	function findItemAtOrAboveLevel(name, targetLevel) {
		for(let i = 0; i < character.items.length; i++) {
			const item = character.items[i];
			if(!item) continue;
			if(item.name !== name) continue;
			if(targetLevel && item.level < targetLevel) continue;
			return i;
		}
	}


}
