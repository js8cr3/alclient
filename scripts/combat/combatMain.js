import { initializeNodes, withinBoundary2D } from './utils.js'
import { symbolA, gridUnit, monsterData } from './settings.js'
import * as impure from '../library/impure.js'

export async function combatMain(characterNamesByClass) {

	const character = this;

	const monsterBoundary = character.getMonsterBoundary(...monsterData);
	monsterBoundary[0] -= gridUnit * 2;
	monsterBoundary[2] += gridUnit * 4;

	const nodes = initializeNodes(monsterBoundary, gridUnit, symbolA);

	const safeSpot = {x: -442, y: -2154};

	if (character.rip) {
		LocalStorage.combatState = 'rip';
	} else {
		LocalStorage.combatState = 'inactive';
	}

	if(character.ctype === 'mage') {

		character.handleMagiportRequest(Object.values(characterNamesByClass));
		while(character.ready) {
			impure.timePrefix(character.name + ' combatState: ' + LocalStorage.combatState)
			await mageLoop();
		}

	} else if(character.ctype === 'priest') {

		while(character.ready) {
			impure.timePrefix(character.name + ' combatState: ' + LocalStorage.combatState)
			await priestLoop();
		}


	} else if(character.ctype === 'warrior') {

		while(character.ready) {
			impure.timePrefix(character.name + ' combatState: ' + LocalStorage.combatState)
			await warriorLoop();
		}

	}

	async function mageLoop() {

		const currentState = LocalStorage.combatState;
		let currentIntervals;

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) {
					LocalStorage.combatState = 'rip'
					return;
				}
				const priest = character.getPlayerByName(characterNamesByClass.priest);
				if(!priest || (priest && priest.rip)) {
					LocalStorage.combatState = 'ready';
					character.retreatToSafety(safeSpot);
				};
			}, 333 );

			const combatLoop = setInterval( () => character.mage(characterNamesByClass.priest), 100 );

			const manouverLoop = setInterval( () => { 
				character.manouver(nodes, monsterBoundary, 'followLeaderStrategy') 
			}, 150 )

			return [ stateChangeLoop, combatLoop, manouverLoop ];

		};

		const readyState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) {
					LocalStorage.combatState = 'rip'
					return;
				}
				if(character.getPlayerByName(characterNamesByClass.priest)) LocalStorage.combatState = 'active';
			}, 333 );

			const combatMiscLoop = setInterval( () => {
				character.combatMisc();
			}, 500 );

			return [ stateChangeLoop, combatMiscLoop ];

		}

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) LocalStorage.combatState = 'rip'
			}, 333);
			
			const combatMiscLoop = setInterval( () => {
				character.combatMisc();
			}, 500);

			const stateChange = async () => {
				try {
					impure.timePrefix('Mage teleporting to combat spot', mageLoop.name, '#fff');
					await character.teleportToSpot();
					LocalStorage.combatState = 'ready';
				} catch(e) {
					if(!character.rip && character.ready) {
						console.error(e);
						throw new Error('teleportToSpot: unknown error');
					};
				}
			};

			stateChange()

			return [ stateChangeLoop, combatMiscLoop ]

		}

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				LocalStorage.combatState = 'inactive';
			}
			stateChange();
			return [];
		};

		const stateSwitch = {
			"ready": readyState,
			"active": activeState,
			"inactive": inactiveState,
			"rip": ripState
		}

		currentIntervals = stateSwitch[currentState]();

		while(LocalStorage.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 500));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

	async function priestLoop() {

		const currentState = LocalStorage.combatState;
		let currentIntervals;

		const readyState = () => {
			LocalStorage.combatState = 'active';
			return [];
		};

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) LocalStorage.combatState = 'rip'
			}, 333);

			const combatLoop = setInterval( () => character.priest(monsterBoundary), 100 );

			const manouverLoop = setInterval( () => { 
				character.manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
			}, 150 );

			return [ stateChangeLoop, combatLoop, manouverLoop ];

		};

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) LocalStorage.combatState = 'rip'
			}, 333 );

			const combatMiscLoop = setInterval( () => character.combatMisc(), 500 )

			const stateChange = async () => {
				while(LocalStorage.combatState === 'inactive') {
					character.requestMagiport(characterNamesByClass.mage); // changes combatState to 'ready' after accepting magiport
					await new Promise(r=>setTimeout(r, 10000));
				}
			}

			stateChange(); 

			return [ stateChangeLoop, combatMiscLoop ];

		};

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				LocalStorage.combatState = 'inactive';
			}
			stateChange();
			return [];
		};

		const stateSwitch = {
			"ready": readyState,
			"active": activeState,
			"inactive": inactiveState,
			"rip": ripState
		}

		currentIntervals = stateSwitch[currentState]();

		while(LocalStorage.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 1000));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

	async function warriorLoop() {

		const currentState = LocalStorage.combatState;
		let currentIntervals;

		const readyState = () => {

			const combatMiscLoop = setInterval( () => character.combatMisc(), 500 );

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) {
					LocalStorage.combatState = 'rip'
					return;
				}
				if(character.getPlayerByName(characterNamesByClass.priest)) LocalStorage.combatState = 'active';
			}, 333 );

			return [ combatMiscLoop, stateChangeLoop ];

		};

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) {
					LocalStorage.combatState = 'rip'
					return;
				}
				const priest = character.getPlayerByName(characterNamesByClass.priest);
				if(!priest || (priest && priest.rip)) {
					LocalStorage.combatState = 'ready';
					character.retreatToSafety(safeSpot);
				}
			}, 333); 

			const combatLoop = setInterval( () => { 
				character.warrior(characterNamesByClass.priest);
			}, 100); 

			const warriorMoveLoop = setInterval( () => { 
				character.warriorMove(characterNamesByClass.priest);
			}, 250)

			return [ stateChangeLoop, combatLoop, warriorMoveLoop ];

		};

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(LocalStorage.combatState !== currentState) return;
				if(character.rip) LocalStorage.combatState = 'rip'
			}, 333 );

			const combatMiscLoop = setInterval( () => {
				character.combatMisc();
			}, 500 );

			const stateChange = async () => {
				while(LocalStorage.combatState === 'inactive') {
					character.requestMagiport(characterNamesByClass.mage); // changes combatState to 'ready' after accepting magiport
					await new Promise(r=>setTimeout(r, 10000));
				}
			}

			stateChange();

			return [ stateChangeLoop, combatMiscLoop ];

		};

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				LocalStorage.combatState = 'inactive';
			}
			stateChange();
			return [];
		};

		const stateSwitch = {
			"ready": readyState,
			"active": activeState,
			"inactive": inactiveState,
			"rip": ripState
		}

		currentIntervals = stateSwitch[currentState]();

		while(LocalStorage.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 1000));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

};
