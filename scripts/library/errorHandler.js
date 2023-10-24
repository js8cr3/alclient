import * as impure from './impure.js'

export function errorHandler(error) {

	const eString = error.toString();

	const noLogRegexList = [
		
		// skills	
		/^Error: \'.*\' failed \(cooldown\) \(.*ms\)\.$/,
		/^Error: \'.*\' failed \(target \'.*\' not found\)$/,

		// move
		/^Error: move to .*, .* failed$/,
		/^Error: move to \(.*\) failed \(we\'re currently going from \(.*\) to \(.*\)\)$/

	];

	const logRegexList = [

		// sendItem
		/^Error: sendItem timeout \(.*ms\)$/,
	
		// skills
		/^Error: \'.*\' failed \(no_mp\)\.$/,
		/^Error: \'.*\' failed \(too_far\)\.$/,
		/^Error: \'.*\' failed \(disabled\)$/,
		/^Error: \'.*\' failed \(timeout: \(.*ms\)\)$/,

		// pots
		/^Error: Failed to use HP Pot \(not_ready\)$/,
		/^Error: Failed to use MP Pot \(not_ready\)$/,
		/^Error: useHPPot timeout \(1000ms\)$/,
		/^Error: useMPPot timeout \(1000ms\)$/,

		// smartMove
		/^Error: smartMove to undefined:.*,.* cancelled \(new smartMove started\)$/,
		/^Error: We are having some trouble smartMoving\.\.\.$/

	]

	for(const regex of noLogRegexList) {
		if( eString.match(regex) ) return;
	}

	impure.timePrefix(error, '', '#F00');

	for(const regex of logRegexList) {
		if( eString.match(regex) ) return;
	}

	console.error(error);

/*
	for(const regex of logRegexList) {
		if( !eString.match(regex) ) continue;
		impure.timePrefix(error, '', '#F00', true);
		return;
	}
*/

}
