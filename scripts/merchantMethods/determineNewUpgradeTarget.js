import * as impure from "../library/impure.js"
import { errorHandler } from '../library/errorHandler.js'
import { LocalStorage } from "../LocalStorage.js"

export default async function determineNewUpgradeTarget(upgradeList) {

    if(!this.ready) throw new Error('Character not ready');
    if(this.map !== 'bank') throw new Error('Not in bank');
    if(this.rip) throw new Error('Character dead');

	const character = this;

	await character.depositItemsToBank(Object.keys(upgradeList));

	const bank = await character.availableBankPacks();
	if(!bank) throw new Error('Failed to load bank');

	if( !quotaIsProvided() ) throw new Error('Provide quantity for item: '+itemName);

	const orderedUpgradeList = organizeUpgradeList();
	determineUpgradeTarget();

	if(!LocalStorage.currentUpgrade) {
		impure.timePrefix(`No upgrade target found`, determineUpgradeTarget.name);
		return 'Finished all upgrades';
	}

	for (const pack of Object.keys(bank)) {
		for (let i = 0; i < bank[pack].length; i++) {
			if(character.countEmptySlots() <= 2) return 'Not enough space in inventory'; // break if there's less than 3 empty slots in inventory
			const item = bank[pack][i];
			if(!item) continue;
			if(whetherToWithdraw(item)) {
				character.withdrawItem(pack, i).catch(errorHandler);
			}
		}
	}

	return 'Found upgrade target';

	// if an upgradeList item has buy value of true, make sure a quota quantity is provided
	function quotaIsProvided() {

		for(const itemName in upgradeList) {
			const listItem = upgradeList[itemName];
			if(listItem.buy && typeof listItem.q === 'undefined') return false;
		}
		return true

	};

	// determine the order of items to upgrade based on their position in upgradeList, and whether buy value is true
	function organizeUpgradeList() {	

		const orderedUpgradeList = [];
		const upgradeListKeys = Object.keys(upgradeList);

		for(let i = upgradeListKeys.length - 1; i >= 0; i--) {
			const upgradeListItem = upgradeList[upgradeListKeys[i]];
			if( !upgradeListItem.buy ) orderedUpgradeList.unshift(upgradeListKeys[i]);  
		}

		for(const key of upgradeListKeys) {
			const upgradeListItem = upgradeList[key];
			if( upgradeListItem.buy ) orderedUpgradeList.push(key);
		}
		
		return orderedUpgradeList;

	}

	// check if item with level lower than targeted level exists in bank
	function upgradableExistsInBank(itemName) {
		for(const pack in bank) {
			for(const slot of bank[pack]) {
				if(!slot) continue;
				if(slot.name !== itemName) continue;
				if(slot.level >= upgradeList[itemName].level) continue;
				return true;
			}
		}
		return false;
	}

	function whetherToUpgrade(itemName) {

		if( upgradableExistsInBank(itemName) ) {

			return true;

		} else if (upgradeList[itemName].buy) { // if the equipment to upgrade is set to be brought, check if the number of equipment that has already reach targeted level reached the quota

			let numberOfUpgraded = 0;
			for(const pack in bank) {
				for(const slot of bank[pack]) {
					if(!slot) continue;
					if(slot.name !== itemName) continue;
					if(slot.level < upgradeList[itemName].level) continue;
					numberOfUpgraded++;
				}
			}
			if(numberOfUpgraded < upgradeList[itemName].q) return true;

		}

	}

	function whetherToCompound(itemName) {

		const listItem = upgradeList[itemName];
		const countItemAtLevel = []; // [# of level 0, # of level 1, ...etc]

		for(const pack in bank) {
			for(const slot of bank[pack]) {
				if(!slot) continue;
				if(slot.name !== itemName) continue;
				if(slot.level >= listItem.level) continue;
				if(!countItemAtLevel[slot.level]) countItemAtLevel[slot.level] = 0;
				countItemAtLevel[slot.level]++
			}
		}

		// for each level, if there is more than 3 of the item at the given level, set to compound the item
		for(let i = 0; i < countItemAtLevel.length; i++) {
			if(countItemAtLevel[i] >= 3) return true;
		}

	}

	function whetherToBuy(itemName) {

		if( 
			!upgradableExistsInBank(itemName) && 
			upgradeList[itemName].buy
		) {
			LocalStorage.upgradeBuy = true;
		} else { 
			LocalStorage.upgradeBuy = false;
			if(upgradeList[itemName].buy) {
				impure.timePrefix(`Upgrading leftover ${itemName}s in bank`, determineNewUpgradeTarget.name);
			}
		};

	}

	// for each equipmentin upgradeList, check whether to upgrade the given equipment
	function determineUpgradeTarget() {

		for(const itemName of orderedUpgradeList) {

			if( character.G.items[itemName].upgrade && !whetherToUpgrade(itemName) ) continue;
			if( character.G.items[itemName].compound && !whetherToCompound(itemName) ) continue;
			LocalStorage.currentUpgrade = itemName;
			whetherToBuy(itemName);
			impure.timePrefix(`Current upgrade target: ${LocalStorage.currentUpgrade}`, determineNewUpgradeTarget.name);
			break;

		}

	}

	function whetherToWithdraw(item /*bank slot*/) {
		if(item.name !== LocalStorage.currentUpgrade) return;
		if(item.level >= upgradeList[LocalStorage.currentUpgrade].level) return;
		return true;
	}

}
