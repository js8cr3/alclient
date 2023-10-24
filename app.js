import AL from "alclient"
import * as impure from "./scripts/library/impure.js"
import { Halloween } from "./scripts/halloween/Halloween.js"
import startup from "./scripts/startup.js"

const game_server = ['US', 'I'];
//const party = ["Desk", "Stool", "Shelf"];
const party = ["Desk", "Shelf", "Roof"];

run();

async function run() {

	await Halloween.updateData();

    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()])
    await AL.Pathfinder.prepare(AL.Game.G)

	const startCharacter = characterName => { 		

		return new Promise( async (resolve, reject) => {

			const targetServer = Halloween.getRegionAndIdentifier();

			const character = await AL.Game.startCharacter(characterName, ...targetServer)
			.catch(reject);
			if(!character) return;

			console.log('\x1b[92m%s\x1b[0m', `${characterName} connected`);

			character.socket.on("disconnect", data => {
				console.error(character.name+' disconnected');
				console.error(data);
				reject(data);
			})

			character.startup = startup;
			character.startup().catch( data => {
				console.error(data)
				reject(data);
			});

	        while(character.ready) {
				const currentServer = [character.serverData.region, character.serverData.name];
				if( !Halloween.isInTargetServer(...currentServer) ) {
					impure.timePrefix(character.name + ` is in ${JSON.stringify(currentServer)} while target is in ${JSON.stringify(Halloween.getRegionAndIdentifier())}`, startCharacter.name, '#f90');
					await character.disconnect();
				}
				await new Promise(r => setTimeout(r,1000));
   		    }

		} ) 
	
	};

	const setTargetDataLoop = async () => {
		while(true) {
			await new Promise(r => setTimeout(r,10000));
			await Halloween.updateData();
		}
	}

	const startCharacterLoop = async characterName => {
		while(true) {
			await startCharacter(characterName).catch( e => {
				impure.timePrefix(e, run.name, '#f00', true);
			});
			await new Promise( r => setTimeout(r, 10000) );
		};
	}

	setTargetDataLoop();
	party.forEach(startCharacterLoop);

}

