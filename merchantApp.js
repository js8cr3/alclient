import AL from "alclient"
import * as impure from "./scripts/library/impure.js"
import startupMerchant from "./scripts/startupMerchant.js"
import { Halloween } from "./scripts/halloween/Halloween.js"

run();
async function run() {
	
	await Halloween.updateData();

    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData()])
	await AL.Pathfinder.prepare(AL.Game.G);

	const startMerchant = async (resolve, reject) => { 

		const targetServer = Halloween.getRegionAndIdentifier();

		const merchant = await AL.Game.startMerchant("Bench", ...targetServer)
			.catch(reject);
		if(!merchant) return;

		console.log('\x1b[92m%s\x1b[0m', `${merchant.id} Connected to ${JSON.stringify(targetServer)}`);

		merchant.socket.on('disconnect', data => reject(data) );

		merchant.startupMerchant = startupMerchant;
		merchant.startupMerchant();

		while(merchant.ready) {

			const currentServer = [merchant.serverData.region, merchant.serverData.name];
			if( !Halloween.isInTargetServer(...currentServer) ) {
				impure.timePrefix(merchant.name + ` is in ${JSON.stringify(currentServer)} while target is in ${JSON.stringify(Halloween.getRegionAndIdentifier())}`, startMerchant.name, '#f90');
				await merchant.disconnect();
			}

			await new Promise(r => setTimeout(r,1000));

		}

	};

    const setTargetDataLoop = async () => {
        while(true) {
            await new Promise(r => setTimeout(r,1000 * 120));
			await Halloween.updateData();
        }
    }

	const startMerchantLoop = async () => {
		while(true) {
			await new Promise(startMerchant).catch( error => {
				impure.timePrefix(error, run.name, '#f00', true);
			} );
			await new Promise( r => setTimeout(r, 10000) );
		};
	}

    setTargetDataLoop();
	startMerchantLoop();
	
}

