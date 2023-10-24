import { Database } from '../../node_modules/alclient/build/database/Database.js'
import { DisplayDataModel } from './models/displayData.model.js'

export default async function updateDatabase() {

	if(!Database.connection) return;

	console.log('Connected to mongodb');
	this.socket.on('player', data => {
		if(data.id !== this.id) return;
		const updateData = {
			hp: this.hp,
			max_hp: this.max_hp,
			mp: this.mp,
			max_mp: this.max_mp,
			max_xp: this.max_xp,
			xp: this.xp,
			gold: this.gold,
			level: this.level,
			q: this.q,
			moving: this.moving
		};
		DisplayDataModel.updateOne(
			{ name: this.id }, 
			updateData, 
			{ upsert: true }
		).lean().exec();
	});

}
