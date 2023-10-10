# alclient
```javascript
import AL from "alclient"
import { Database } from './node_modules/alclient/build/database/Database.js'
import assignMethods from "./scripts/library/assignMethods.js"
import assignCombatMethods from "./scripts/combat/assignCombatMethods.js"

const game_server = ['US', 'III'];
const party = ["Desk", "Stool", "Shelf"];

run();

async function run() {

    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()])
    await AL.Pathfinder.prepare(AL.Game.G)

	const startCharacter = characterName => { return new Promise( async (resolve, reject) => {
		
		try {
			
			const character = await AL.Game.startCharacter(characterName, ...game_server);
			console.log('\x1b[92m%s\x1b[0m', `${characterName} connected`);

			character.socket.on("disconnect", data => {
				console.log(character.name+' DISCONNECTED');
				console.debug(data);
				reject(data);
			})

			assignMethods(character);
			assignCombatMethods(character);
			character.startup();

		} catch (error) {

			reject(error);

		}

	} ) };

	const startCharacterLoop = async characterName => {
		while(true) {
			await startCharacter(characterName).catch( e => {
				console.error(e)
			});
			await new Promise( r => setTimeout(r, 10000) );
		};
	}

	party.forEach(startCharacterLoop);

}
```
```js
import AL from "alclient"
import assignMethods from "./scripts/library/assignMethods.js"

run();
async function run() {

    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()])
	await AL.Pathfinder.prepare(AL.Game.G);

	const startMerchant = async () => { 

		const merchant = await AL.Game.startMerchant("Bench", "US", "III");
		console.log('\x1b[92m%s\x1b[0m', `${merchant.id} Connected`);

		merchant.socket.on('disconnect', data => {
			throw new Error(data);
		});

		assignMethods(merchant);
		merchant.startupMerchant();

	} ;

	while(true) {
		await startMerchant().catch( console.error );
		await new Promise( r => setTimeout(r, 10000) );
	};

}
```
