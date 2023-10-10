import * as utils from "../library/utils.js"

export function disperseOnCombinedDamage() {

	const callback = () => {
		this.move(
			this.x + utils.randomNum(-20, 20),
			this.y + utils.randomNum(-20, 20)
		).catch(()=>{});
	}

	this.socket.on('hit', data => {
        if(!data.stacked) return;
		if(data.id !== this.id) return;
		callback();
    }); 

}
