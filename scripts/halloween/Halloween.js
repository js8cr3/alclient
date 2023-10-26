import * as impure from "../library/impure.js"

const halloweenDataURL = 'https://aldata.earthiverse.ca/halloween';

export class Halloween {

	static data;

	static getRegionAndIdentifier = () => {
		if(!this.data) throw new Error('No halloween data');
		return [this.data.serverRegion, this.data.serverIdentifier];
	}

	static isInTargetServer = (currentServerRegion, currentServerIdentifier) => {
		const serverData = this.getRegionAndIdentifier();
		if(currentServerRegion !== serverData[0]) return false;
		if(currentServerIdentifier !== serverData[1]) return false;
		return true;
	}

	static updateData = async () => {
		this.data = await this.getHalloweenData();
	}

	static updateDataLoop = async () => {
        while(true) {
            await new Promise(r => setTimeout(r,10000));
            await this.updateData().catch(console.error);
        }
	}

	static getHalloweenData = async () => {

		let fetchObject;
		while(true) { 

			fetchObject = await fetch(halloweenDataURL);
			if(fetchObject.ok) break;

			let fetchError = 'Unknown FETCH error';
			if(fetchObject?.status === 429) fetchError = 'STATUS 429';

			for(let i = 9 + Math.floor( Math.random() * 9 ); i >= 0; i--) {
				impure.timePrefix(character.name + ': ' + fetchError + ', try again in ' + i, this.getHalloweenData.name);
				await new Promise(r=>setTimeout(r,1000));
			}

		}   

		const dataJSON = await fetchObject.json();
		impure.timePrefix(
			`${dataJSON[0].type} | hp: ${dataJSON[0].hp} | target: ${dataJSON[0].target} | ${dataJSON[0].serverRegion + dataJSON[0].serverIdentifier}`, 
			this.getHalloweenData.name
		);
		return dataJSON[0];

	}

}
