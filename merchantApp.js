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
