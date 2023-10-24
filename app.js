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
