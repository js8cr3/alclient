import { symbolA, symbolB, symbolC, symbolD, pathSymbol, wallSymbol, destSymbol, obstacleSymbol } from './settings.js'
import { closestCellToTarget, withinRange, translatePositionToGridCoor, closestCellToCenter } from './utils.js' 
import fill from './pathfinding/fill.js'
import bfsGrid from './pathfinding/bfsGrid.js'

export {
	aggroKiteStrategy,
	followLeaderStrategy 
};

function aggroKiteStrategy(grid, start, range) {

	// possible values:
		// 'startType error'
		// bfsGrid()
		// 'outside attack range'
		// 'stuck in obstacle'

	let deep = structuredClone(grid);
	const startType = deep[start[1]][start[0]]
	
	// if stuck, return
	
	if(startType === obstacleSymbol) {
		return 'stuck in obstacle';
	}

	// transform grid to be suitable for bfs function

	const transformGrid = () => {

		const symbolTransformList = {};
		symbolTransformList[symbolA] = null;
		symbolTransformList[symbolB] = null;
		symbolTransformList[symbolC] = null;
		symbolTransformList[symbolD] = null;

		switch(startType) {
			case symbolA:
				symbolTransformList[symbolA] = pathSymbol;
				symbolTransformList[symbolB] = wallSymbol;
				symbolTransformList[symbolC] = wallSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolB:
				symbolTransformList[symbolA] = destSymbol;
				symbolTransformList[symbolB] = pathSymbol;
				symbolTransformList[symbolC] = wallSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolC:
				symbolTransformList[symbolA] = destSymbol;
				symbolTransformList[symbolB] = destSymbol;
				symbolTransformList[symbolC] = pathSymbol;
				symbolTransformList[symbolD] = wallSymbol;
				break;
			case symbolD:
				symbolTransformList[symbolA] = destSymbol;
				symbolTransformList[symbolB] = destSymbol;
				symbolTransformList[symbolC] = destSymbol;
				symbolTransformList[symbolD] = pathSymbol;
		};
			
		const transformCell = (row, cell, cellIndexInRow) => {
			for(const symbolToChange in symbolTransformList) {
				if(cell === symbolToChange) {
					row[cellIndexInRow] = symbolTransformList[symbolToChange]
					break;
				}
			}
		}

		for(const row of deep) {
			for(let i = 0; i < row.length; i++) {
				transformCell(row, row[i], i);
			}
		}

	}

	// pathfinding

	const pathfinding = () => {

		transformGrid();
		const setCenterOfCurrentArea = () => {
			const currentArea = fill(deep, start, pathSymbol);
			const endCoor = closestCellToCenter(deep, currentArea);
			deep[endCoor[1]][endCoor[0]] = destSymbol;
		}

		if(startType === symbolA) {
			setCenterOfCurrentArea();
		}

		let pathToDestination = bfsGrid(deep, start);
		if(pathToDestination === 'no path') {
			if(startType !== symbolB) return 'no path';
			deep = structuredClone(grid);
			transformGrid();
			setCenterOfCurrentArea();
			pathToDestination = bfsGrid(deep, start);
		}
		//utils.consoleDisplayGrid(deep);

		return pathToDestination;

	};

	const target = this.getTargetEntity();
	if( 
		range && 
		startType === symbolA && 
		target && !withinRange(this, target, range)
	) {
		return 'outside attack range';
	} else {
		return pathfinding();
	}

}

function followLeaderStrategy(grid, start, boundary, gridUnit) {

	// possible values:
		// 'startType error'
		// bfs()
		// 'stuck in obstacle'

	let deep = structuredClone(grid);
	const startType = deep[start[1]][start[0]]
	
	// if stuck, move in random direction
	
	if(startType === obstacleSymbol) {
		return 'stuck in obstacle';
	}

	// transform grid to be suitable for bfs function

	const transformGrid = () => {

		const symbolTransformList = {};
		const listKeys = [symbolA, symbolB, symbolC, symbolD];
		let listValues;

		switch(startType) {
			case symbolA:
				listValues = [pathSymbol, pathSymbol, wallSymbol, wallSymbol]
				break;
			case symbolB:
				listValues = [pathSymbol, pathSymbol, wallSymbol, wallSymbol];
				break;
			case symbolC:
				listValues = [destSymbol, destSymbol, pathSymbol, wallSymbol]
				break;
			case symbolD:
				listValues = [destSymbol, destSymbol, destSymbol, pathSymbol]
		};

		for(let i = 0; i < listKeys.length; i++) {
			symbolTransformList[ listKeys[i] ] = listValues[i];	
		}
			
		const transformCell = (row, cell, cellIndexInRow) => {
			for(const symbolToChange in symbolTransformList) {
				if(cell === symbolToChange) {
					row[cellIndexInRow] = symbolTransformList[symbolToChange]
					break;
				}
			}
		}

		for(const row of deep) {
			for(let i = 0; i < row.length; i++) {
				transformCell(row, row[i], i);
			}
		}

	}

	// pathfinding

	const character = this;
	const pathfinding = () => {

		transformGrid();

		const setDestinationToTarget = () => {
			const follow = character.getPlayerByName('Stool');
			if(!follow) {
				return 'target to follow does not exist';
			}
			const targetCoor = translatePositionToGridCoor([follow.x, follow.y], boundary, gridUnit);
			if(!targetCoor) return 'no path';
			const currentArea = fill(deep, start, pathSymbol);
			const endCoor = closestCellToTarget(deep, currentArea, targetCoor)
			deep[endCoor[1]][endCoor[0]] = wallSymbol;
			for(const cell of currentArea) {
				if( Math.abs( endCoor[0] - cell[0] ) > 1 ) continue;
				if( Math.abs( endCoor[1] - cell[1] ) > 1 ) continue;
				deep[cell[1]][cell[0]] = destSymbol;
			}
		}

		if(startType === symbolB || startType === symbolA) {
			setDestinationToTarget();
		}

		let pathToDestination = bfsGrid(deep, start);
		if(pathToDestination === 'no path') return 'no path';
		//utils.consoleDisplayGrid(deep);

		return pathToDestination;

	};

	return pathfinding();

}



