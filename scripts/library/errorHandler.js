import * as impure from './impure.js'

export function errorHandler(error) {
	const eString = error.toString();
	const noLogRegexList = [
		/^Error: \'attack\' failed \(cooldown\) \(.*ms\).$/,
		/^Error: move to .*, .* failed$/,
		/^Error: move to \(.*\) failed \(we\'re currently going from \(.*\) to \(.*\)\)$/
	];
	const logRegexList = [
		/^Error: \'attack\' failed \(timeout: \(1000ms\)\)$/,
		/^Error: Failed to use HP Pot \(not_ready\)$/,
		/^Error: Failed to use MP Pot \(not_ready\)$/,
		/^Error: useHPPot timeout \(1000ms\)$/,
		/^Error: useMPPot timeout \(1000ms\)$/,
		/^Error: \'magiport\' failed \(target \'.*\' not found\)$/,
		/^Error: \'attack\' failed \(target \'.*\' not found\)$/
	]
	for(const regex of noLogRegexList) {
		if( eString.match(regex) ) return;
	}
	for(const regex of logRegexList) {
		if( !eString.match(regex) ) continue;
		impure.timePrefix(error, '#F00');
		return;
	}
	throw new Error(error);
}
