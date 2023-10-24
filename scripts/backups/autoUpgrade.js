import * as impure from "../library/impure.js"

export default async function autoUpgrade(upgradeList, minGold) {
	
	const findItemUnderLevel = (name, targetLevel) => {
		for(let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			if(!item) continue;
			if(item.name !== name) continue;
			if(targetLevel && item.level >= targetLevel) continue;
			return i;
		}
	}

	const scrollTypeNeeded = item => {
		if( item.level < this.G.items[item.name].grades[0] ) return 'scroll0';
		return 'scroll1';
	}
	
	const upgradeProcess = (equipment, level, quantity) => {
		
		return new Promise( async (resolve, reject) => {

			// check if there is already enough upgraded equipment 
			let numberOfSufficientEquipment = 0;
			for(const item of this.items) {
				if(!item) continue;	
				if(item.name === equipment && item.level >= level) numberOfSufficientEquipment++;
				if(numberOfSufficientEquipment < quantity) continue;
				resolve('Quota fulfilled');
				return;
			}
			
			// check if there is any equipment left to upgrade (if buy isn't set to true), and if there is enought gold. if the check is passed then buy equipment and scrolls if the character doesn't already have them
			let currentUpgrade = findItemUnderLevel(equipment, level);
			if(!currentUpgrade) {
				if( !upgradeList[equipment].buy ) {
					resolve('No more to upgrade');
					return;
				}
				if( upgradeList[equipment].buy && this.gold < minGold ) {
					reject(`Current gold (${this.gold}) less than threshold (${minGold})`)
					return;
				}
				await this.buy(equipment)
				.then( data => {
					currentUpgrade = data;
				} )
				.catch( reject );
			};
			const scrollType = scrollTypeNeeded(this.items[currentUpgrade]);
			let scrollLocation = findItemUnderLevel(scrollType);
			if(!scrollLocation) {
				await this.buy(scrollType)
				.then( data => scrollLocation = data )
				.catch( reject );
			};

			// check if there is any ongoing upgrades
			if(this.q.upgrade) {
				impure.functionMessage(`Waiting for previous upgrade to finish (${this.q.upgrade.len} seconds)`, autoUpgrade.name);
				await new Promise( r => setTimeout(r, this.q.upgrade.len + 2000) );
			}

			impure.functionMessage(`Upgrading ${this.items[currentUpgrade].name}+${this.items[currentUpgrade].level}`, autoUpgrade.name, '#777');

			// upgrade
			await this.upgrade(currentUpgrade, scrollLocation).catch( reject );

			resolve('Upgrade finished');
			
		} )
		
	}
						  
	// organize the array to upgrade based on the order of items, and whether buy value is true
	const autoUpgradeArray = [];
	const upgradeArray = Object.keys(upgradeList);
	for(let i = upgradeArray.length - 1; i >= 0; i--) {
		const equipment = upgradeList[ upgradeArray[i] ];
		if( !equipment.buy ) autoUpgradeArray.unshift(upgradeArray[i]); 
	}
	for(const equipment of upgradeArray) {
		if(upgradeList[equipment].buy) autoUpgradeArray.push(equipment);
	}

	// keep upgrading equipment of the same type until a condition is met
	const upgradeLoop = equipment => {
		
		let moveOnToDifferentEquipment = false;
		let abort = false;
		let upgradeProcessData;

		return new Promise( async (resolve, reject) => {

			const handleUpgradeError = error => {
				const timeoutRegex = /^Error: Failed to upgrade \(Timeout: .*ms\)$/;
				if( error.toString().match(timeoutRegex) ) {
					upgradeProcessData = 'Upgrade timeout';
					impure.functionMessage(error.toString(), autoUpgrade.name, '#F00');
					return;
				};
				abort = true;
				reject(error);
			};

			while( !abort && !moveOnToDifferentEquipment ) {

				if(this.performingRoutine) return reject('Performing merchant routine');

				await upgradeProcess(
					equipment, upgradeList[equipment].level, upgradeList[equipment].q
				).then( data => {
					upgradeProcessData = data;
				} ).catch( handleUpgradeError )

				if(upgradeProcessData === 'Upgrade timeout') {
					await new Promise( r => setTimeout(r, 10000) );
					continue;
				};

				if(upgradeProcessData === 'Upgrade finished') continue;

				moveOnToDifferentEquipment = true;

			}

			resolve(upgradeProcessData);

		} );

	}

	// perform upgrade loop for every item in the array
	for(const equipment of autoUpgradeArray) {

		if(this.performingRoutine) break;

		impure.functionMessage(`Attempting ${equipment} upgrades`, autoUpgrade.name);

		let abort = false;

		await upgradeLoop(equipment)
		.then( data => impure.functionMessage(data, autoUpgrade.name) )
		.catch( error => {
			impure.functionMessage(error, autoUpgrade.name, (error instanceof Error ? undefined : '#F00') );
			abort = true;
		} );
		
		if(abort) break;
	}
	
}
