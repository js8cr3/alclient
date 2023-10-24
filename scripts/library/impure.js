import { Chalk } from 'chalk'
import date from 'date-and-time'

export function functionMessage(message, functionName, hex = '#9A9996') {
	const chalk = new Chalk({level: 3});
	const cTime = chalk.hex('#444')(date.format(new Date, 'HH:mm:ss:SS'));
    console.log( 
		cTime + '	' + chalk.hex(hex)(message) + chalk.hex('#444')(`${ functionName ? ' - ' : '' }${functionName}`)
	);
}

export function timePrefix(message, hex = '#9a9996') { 
	const chalk = new Chalk({level: 3});
	const cTime = chalk.hex('#444')(date.format(new Date, 'HH:mm:ss:SS'));
	console.log(cTime + '	' + chalk.hex(hex)(message));
}
