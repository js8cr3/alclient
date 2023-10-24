export function stringIsJSON(string) {
	try {
		JSON.parse(string);
	} catch(e) {
		return false;
	}
	return true;
} 

export function distance(entity1, entity2) {
	// entities: {x: Number, y: Number}
	return Math.sqrt(
		Math.pow( (entity2.x - entity1.x), 2 ) + 
		Math.pow( (entity2.y - entity1.y), 2 ) 
	);
};

export function aOrAn(string) {
	if( /^[aeiouAEIOU]/.test(string) ) return 'an';
	return 'a';
}

export function logMap(map) {
	const entries = [];
	for(const entry of map.entries()) {
		entries.push(entry);
	}
	return JSON.stringify(entries);
}

export function randomNum(min, max) {
	const diff = max - min;
	return Math.random() * diff + min;
}
