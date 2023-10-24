export function arrayHasEquivelantValues(arr1, arr2) {
    if(arr1.length !== arr2.length) return false;
    for(let i = 0; i < arr1.length; i++) {
        if(arr1[i] !== arr2[i]) return false;
    }
    return true;
}

export function randomColor() {
    const randomHex = () => {
        let digits = '3456789abcdef'.split('');
        const randomIndex = Math.floor( Math.random() * (digits.length) );
        return digits[randomIndex];
    }   
    return '#' + randomHex() + randomHex() + randomHex();
}

export function randomHexNum() {
    // semi random
    return parseInt((
      (0x380000 * Math.floor( 5 * Math.random() ) + 0x100000) + 
      (0x3800 * Math.floor( 5 * Math.random() ) + 0x1000) + 
      (0x38 * Math.floor( 5 * Math.random() ) + 0x10)
    ).toString(16), 16);
}

export async function runPromiseUntilSuccess(asyncFunction, errorHandler, maxAttempts = 5, interval = 1000) {

	let success = false;

	for(let i = 0; i < maxAttempts; i++) {

		await asyncFunction()
		.then( () => success = true)
		.catch(errorHandler);

		if(success) return;

	}

	throw new Error('Exceeded max attempts');

}

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
