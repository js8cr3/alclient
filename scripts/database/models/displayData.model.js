import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DisplayDataSchema = new Schema({
	name: String,
	hp: Number,
	max_hp: Number,
	mp: Number,
	max_mp: Number,
	level: Number,
	xp: Number,
	max_xp: Number,
	gold: Number,
	q: Object,
	moving: Boolean
});

export const DisplayDataModel = mongoose.model('DisplayData', DisplayDataSchema);
