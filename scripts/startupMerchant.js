import * as impure from './library/impure.js'
import { errorHandler } from './library/errorHandler.js'
import { assignMethods } from "./library/assignMethods.js"
import { LocalStorage } from "./LocalStorage.js"

const partyList = ['Desk', 'Stool', 'Shelf', 'Roof'];
const mageName = 'Desk';
const itemsToBuy = {
	'mpot0': 9999,
	'hpot1': 9999
};
const itemsToSell = ['ringsj', 'hpbelt', 'hpamulet', 'gphelmet'];
const restSpot = {map: 'main', x: -210, y: -80}
const grindSpot = {map: 'main', x: 1480, y: -390} // obsolete for now due to magiport
const upgradeList = {
	vitring: {level: 2},
	dexring: {level: 3},
	strring: {level: 3},
	intring: {level: 3},
	intbelt: {level: 2},
	dexbelt: {level: 2},
	strbelt: {level: 2},
	intamulet: {level: 3},
	dexamulet: {level: 3},
	stramulet: {level: 3},
	phelmet: {level: 7},
	quiver: {level: 7},
	wcap: {level: 8},
	wattire: {level: 8},
	wshoes: {level: 8},
	wgloves: {level: 8},
	wbreeches: {level: 8},
};
const itemsToDeposit = ['armorbox','weaponbox','scroll1','cscroll1','leather','ringjs'];
for(const itemName in upgradeList) itemsToDeposit.push(itemName);
const upgradeMinGold = 9999999;

export default async function startupMerchant() {

	assignMethods(this);

	const callStartupMethods = () => {
		this.handleMagiportInvite(mageName);
		this.gameMessages();
		this.merchantOnCM(partyList);
		this.updateDatabase();
	}

	for(let i = 0; !this.ready; i++) {
		await new Promise(r=>setTimeout(r,500));
		if(i > 99) throw new Error('Character failed to load');
	}

	await new Promise(r => setTimeout(r, 3000));

	callStartupMethods();
	const merchantLoopInterval = setInterval( () => this.merchantLoop(), 1000);

	let routineCooldown = false;
	let cooldownTimeout;

	const resetRoutineCooldown = () => {
		if(cooldownTimeout) clearTimeout(cooldownTimeout);
		routineCooldown = true;
		cooldownTimeout = setTimeout( () => routineCooldown = false, 60000 * 10 );
	}

	const handleDeath = async () => {
		impure.timePrefix(this.name+ ' died, respawning', startupMerchant.name);
		await new Promise(r => setTimeout(r, 15000));
		await this.respawn()
		await new Promise(r => setTimeout(r, 3000));
		impure.timePrefix(this.name + ' respawned', startupMerchant.name);
	}

	while(this.ready) {

		try {

			if(this.rip) await handleDeath();

			if (!routineCooldown) {
				resetRoutineCooldown();
				await this.merchantRoutine(partyList, itemsToBuy, itemsToSell, itemsToDeposit, restSpot, grindSpot, mageName);
			}

			const upgradeResult = await this.autoUpgrade(upgradeList, upgradeMinGold, restSpot);
			if(
				upgradeResult === 'Finished all upgrades' || 
				upgradeResult === 'Not enough space in inventory' || 
				upgradeResult === 'Not enough gold' 
			) {
				await this.openMerchantStand();
				while(routineCooldown && this.ready) {
					await new Promise(r => setTimeout(r, 1000));
				}
			}

		} catch (error) {

			errorHandler(error);

		}

		await new Promise(r => setTimeout(r, 500));

	}

	clearInterval(merchantLoopInterval);

};
