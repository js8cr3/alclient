import * as impure from "./impure.js"
import * as utils from "./utils.js"
import { errorHandler } from "./errorHandler.js"

export function hasEnoughHPOrMP(HPOrMP, ratio) {
	HPOrMP = HPOrMP.toLowerCase();
	const maxHPOrMP = 'max_' + HPOrMP;
	if( this[HPOrMP] < this[maxHPOrMP] * ratio ) {
		impure.functionMessage(this.id + ' does not have enough ' + HPOrMP, 'hasEnoughHPOrMP')
		return false;
	}
	return true;
}

export function getPlayerByName(name) {
	for(const [, player] of this.players) {
		if(player.id === name) return player;
	}
}

export function loot() {
    const chestEntries = this.chests.keys();
    const chests = [];
    for(const entry of chestEntries) {
            chests.push(entry);
    };
    if(!chests.length) return;
    this.socket.emit('open_chest', {'id': chests[0]});
}

export function getEntityByID(id) {
	for(const [, entity] of this.entities) {
		if(entity.id !== id) continue;
		return entity;
	}
};

export function countEmptySlots() {
	let number = 0;
	for(const item of this.items) {
		if(!item) number++;
	}
	return number;
}
