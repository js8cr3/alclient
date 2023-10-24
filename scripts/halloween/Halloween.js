import * as switchServer from "./switchServer.js"

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
		this.data = await switchServer.getHalloweenData();
	}

}
