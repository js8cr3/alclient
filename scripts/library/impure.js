import { Chalk } from 'chalk'
import date from 'date-and-time'

export function timePrefix(message, label = '', hex = '#9a9996', isError) { 
	const chalk = new Chalk({level: 3});
	const cTime = chalk.hex('#444')(date.format(new Date, 'HH:mm:ss:SS'));
	const messageLog = cTime + '	' + chalk.hex(hex)(message) + chalk.hex('#444')(`${ label ? ' - ' : '' }${label}`);
	if(isError) {
		console.error(messageLog);
		return;
	}
	console.log(messageLog);
}
