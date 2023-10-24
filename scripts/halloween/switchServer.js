import { arrayHasEquivelantValues } from "../library/utils.js"
import * as impure from "../library/impure.js"

const halloweenDataURL = 'https://aldata.earthiverse.ca/halloween';

export async function getHalloweenData(character) {

	let logFunction = impure.timePrefix;

	if(!character) {
		character = {name: 'app.js'};
	}

	let success;
	let fetchObject;
	while( !success ) {

		fetchObject = await fetch(halloweenDataURL).catch(()=>{});
		if(fetchObject.ok) success = true;

		if(!success) {

			let fetchError = 'Unknown FETCH error';
			if(fetchObject?.status === 429) fetchError = 'STATUS 429';

			for(let i = 9 + Math.floor( Math.random() * 9 ); i >= 0; i--) {
				logFunction(character.name + ': ' + fetchError + ', try again in ' + i, getHalloweenData.name);
				await new Promise(r=>setTimeout(r,1000));
			}

		}

	}

	const dataJSON = await fetchObject.json();
	logFunction(dataJSON[0].type+' hp: '+dataJSON[0].hp, getHalloweenData.name);
	return dataJSON[0];

}
