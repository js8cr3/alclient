import * as impure from './library/impure.js'

const partyList = ['Desk', 'Stool', 'Shelf'];
const mageName = 'Desk';
const itemsToBuy = {
	'mpot0': 9999,
	'hpot1': 9999
};
const itemsToSell = ['ringsj', 'hpbelt', 'hpamulet'];
const restSpot = {map: 'main', x: -210, y: -80}
const grindSpot = {map: 'main', x: 1480, y: -390}
const exitBank = {map: 'main', x: 168, y: -134}
const upgradeList = {
//	staff: {level: 9, q: 1, buy: 1},
	vitring: {level: 2},
	dexring: {level: 2},
	strring: {level: 2},
	intring: {level: 2},
//	helmet: {level: 9, q: 1, buy: 0},
	pants: {level: 9, q: 3, buy: 0},
	gloves: {level: 9, q: 3, buy: 0},
	quiver: {level: 7},
	wcap: {level: 8},
	wattire: {level: 8},
	wshoes: {level: 8},
};
const upgradeMinGold = 2999999;

export default async function startupMerchant() {

	const callStartupMethods = () => {
		this.handleMagiportInvite(mageName, () => this.magiportAccepted = true);
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
	setInterval( () => this.merchantLoop(), 1000);

	// merchantRoutine and autoUpgrade

	let routineCooldown = false;
	let cooldownTimeout;

	const resetRoutineCooldown = () => {
		if(cooldownTimeout) clearTimeout(cooldownTimeout);
		routineCooldown = true;
		cooldownTimeout = setTimeout( () => routineCooldown = false, 60000 * 10 );

	}

	const handleDeath = async () => {
		impure.functionMessage(this.name+ ' died, respawning', startupMerchant.name);
		await new Promise(r => setTimeout(r, 15000));
		await this.respawn()
		await new Promise(r => setTimeout(r, 3000));
		impure.functionMessage(this.name + ' respawned', startupMerchant.name);
	}

	const merchantActivity = async () => {
		impure.functionMessage('Moving to bank to deposit items', startupMerchant.name);
		await this.closeMerchantStand();
		await this.smartMove('bank');
		await new Promise(r => setTimeout(r, 3000));
		impure.functionMessage('Depositing items to bank', startupMerchant.name);
		await this.depositItemsToBank(Object.keys(upgradeList));
		await this.smartMove(exitBank);
		await this.merchantRoutine(partyList, itemsToBuy, itemsToSell, restSpot, grindSpot);
	}

	while(this.ready) {

		try {

			if(this.rip) await handleDeath();

			if (!routineCooldown) {
				resetRoutineCooldown();
				await merchantActivity();
			}

			const upgradeResult = await this.autoUpgrade(upgradeList, upgradeMinGold, restSpot);
			if(
				upgradeResult === 'Finished all upgrades' || 
				upgradeResult === 'Not enough gold' 
			) {
				await this.openMerchantStand();
				while(routineCooldown && this.ready) {
					await new Promise(r => setTimeout(r, 1000));
				}
			}

		} catch (error) {

			console.debug(error);	

		}

		await new Promise(r => setTimeout(r, 10000));

	}

};
