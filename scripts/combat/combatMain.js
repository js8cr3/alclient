import { initializeNodes, withinBoundary2D } from './utils.js'
import { symbolA, gridUnit, monsterData } from './settings.js'
import * as impure from '../library/impure.js'

export { combatMain };

function combatMain() {

	const character = this;

	const monsterBoundary = this.getMonsterBoundary(...monsterData);
	monsterBoundary[0] -= gridUnit * 2;
	monsterBoundary[2] += gridUnit * 4;

	const nodes = initializeNodes(monsterBoundary, gridUnit, symbolA);

	const mageName = 'Desk';
	const priestName = 'Stool'
	const partyList = ['Desk', 'Stool', 'Shelf', 'Bench'];
	const safeSpot = {x: -442, y: -2154};

	if(this.ctype === 'mage') {
		this.handleMagiportRequest(partyList);
		mageCombat();
	} else if(this.ctype === 'priest') {
		this.handleMagiportInvite(mageName, () => this.combatState = 'ready');
		priestCombat();
	} else if(this.ctype === 'warrior') {
		this.handleMagiportInvite(mageName, () => this.combatState = 'ready');
		warriorCombat();
	}

	async function priestCombat() {
		if( 
			!character.rip && 
			withinBoundary2D(character, monsterBoundary) 
		){
			character.combatState = 'active';
		} else if (character.rip) {
			character.combatState = 'rip';
		} else {
			character.combatState = 'inactive';
		}
		while(character.ready) {
			console.log(character.name + ' ' + character.combatState)
			await priestLoop();
		}
	}

	async function mageCombat() {
		const priest = character.getPlayerByName(priestName);
		if( 
			priest && 
			!priest.rip && 
			withinBoundary2D(character, monsterBoundary) 
		) {
			character.combatState = 'active';
		} else if (character.rip) {
			character.combatState = 'rip';
		} else {
			character.combatState = 'inactive';
		}
		while(character.ready) {
			console.log(character.name + ' ' + character.combatState)
			await mageLoop();
		}
	}

	async function warriorCombat() {
		const priest = character.getPlayerByName(priestName);
		if( 
			priest && 
			!priest.rip && 
			withinBoundary2D(character, monsterBoundary) 
		) {
			character.combatState = 'active';
		} else if (character.rip) {
			character.combatState = 'rip';
		} else {
			character.combatState = 'inactive';
		}
		while(character.ready) {
			console.log(character.name + ' ' + character.combatState)
			await warriorLoop();
		}

	}

	async function mageLoop() {

		const currentState = character.combatState;
		let currentIntervals;

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					character.combatState = 'rip'
					return;
				}
				const priest = character.getPlayerByName(priestName);
				if(!priest || (priest && priest.rip)) {
					character.combatState = 'ready';
					character.retreatToSafety(safeSpot);
				};
			}, 333 );

			const combatLoop = setInterval( () => character.mage(priestName), 100 );

			const manouverLoop = setInterval( () => { 
				character.manouver(nodes, monsterBoundary, 'followLeaderStrategy') 
			}, 150 )

			return [ stateChangeLoop, combatLoop, manouverLoop ];

		};

		const readyState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					character.combatState = 'rip'
					return;
				}
				if(character.getPlayerByName(priestName)) character.combatState = 'active';
			}, 333 );

			const combatMiscLoop = setInterval( () => {
				character.combatMisc();
			}, 500 );

			return [ stateChangeLoop, combatMiscLoop ];

		}

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) character.combatState = 'rip'
			}, 333);
			
			const combatMiscLoop = setInterval( () => {
					character.combatMisc();
			}, 500);

			const stateChange = async () => {
				try {
					impure.functionMessage('Mage teleporting to combat spot', mageLoop.name, '#fff');
					await character.teleportToSpot();
					character.combatState = 'ready';
				} catch(e) {
					console.error(e);
					if(!character.rip) throw new Error('teleportToSpot: unknown error');
				}
			};

			stateChange()

			return [ stateChangeLoop, combatMiscLoop ]

		}

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				character.combatState = 'inactive';
			}
			stateChange();
			return [];
		};

		switch(currentState) {
			case 'active':
				currentIntervals = activeState();
				break;
			case 'ready':
				currentIntervals = readyState();
				break;
			case 'inactive':
				currentIntervals = inactiveState();
				break;
			case 'rip':
				currentIntervals = ripState();
		}

		while(character.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 500));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

	async function priestLoop() {

		const currentState = character.combatState;
		let currentIntervals;

		const readyState = () => {
			character.combatState = 'active';
			return [];
		};

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) character.combatState = 'rip'
			}, 333);

			const combatLoop = setInterval( () => character.priest(monsterBoundary), 100 );

			const manouverLoop = setInterval( () => { 
				character.manouver(nodes, monsterBoundary, 'aggroKiteStrategy') 
			}, 150 );

			return [ stateChangeLoop, combatLoop, manouverLoop ];

		};

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) character.combatState = 'rip'
			}, 333 );

			const combatMiscLoop = setInterval( () => character.combatMisc(), 500 )

			const stateChange = async () => {
				while(character.combatState === 'inactive') {
					character.requestMagiport(mageName); // changes combatState to 'ready' after accepting magiport
					await new Promise(r=>setTimeout(r, 10000));
				}
			}

			stateChange(); 

			return [ stateChangeLoop, combatMiscLoop ];

		};

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				character.combatState = 'inactive';
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

		while(character.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 1000));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

	async function warriorLoop() {

		const currentState = character.combatState;
		let currentIntervals;

		const readyState = () => {

			const combatMiscLoop = setInterval( () => character.combatMisc(), 500 );

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					character.combatState = 'rip'
					return;
				}
				if(character.getPlayerByName(priestName)) character.combatState = 'active';
			}, 333 );

			return [ combatMiscLoop, stateChangeLoop ];

		};

		const activeState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) {
					character.combatState = 'rip'
					return;
				}
				const priest = character.getPlayerByName(priestName);
				if(!priest || (priest && priest.rip)) {
					character.combatState = 'ready';
					character.retreatToSafety(safeSpot);
				}
			}, 333); 

			const combatLoop = setInterval( () => { 
				character.warrior(priestName);
			}, 100); 

			const warriorMoveLoop = setInterval( () => { 
				character.warriorMove(priestName);
			}, 250)

			return [ stateChangeLoop, combatLoop, warriorMoveLoop ];

		};

		const inactiveState = () => {

			const stateChangeLoop = setInterval( () => {
				if(character.combatState !== currentState) return;
				if(character.rip) character.combatState = 'rip'
			}, 333 );

			const combatMiscLoop = setInterval( () => {
				character.combatMisc();
			}, 500 );

			const stateChange = async () => {
				while(character.combatState === 'inactive') {
					character.requestMagiport(mageName); // changes combatState to 'ready' after accepting magiport
					await new Promise(r=>setTimeout(r, 10000));
				}
			}

			stateChange();

			return [ stateChangeLoop, combatMiscLoop ];

		};

		const ripState = () => {
			const stateChange = async () => {
				await character.handleDeath();
				character.combatState = 'inactive';
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

		while(character.combatState === currentState) {
			await new Promise(r=>setTimeout(r, 1000));
		}

		for(const interval of currentIntervals) {
			clearInterval(interval);
		}

	}

};
