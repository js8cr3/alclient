import { wallSymbol, destSymbol, pathSymbol, visitedSymbol, queuedSymbol } from '../settings.js'
import { simplifyGridPath } from '../utils.js'

export default bfsGrid;

function bfsGrid(grid, s /* start */) {

	// possible return values: 
		// 'no path'
		// 'arrived'
		// reconstructFromPathTrackGrid( found )

	const pathfindGrid = structuredClone(grid);

	// if the start cell is the destination, return
	if( pathfindGrid[s[1]][s[0]] === destSymbol ) return 'arrived';

	// setup grid to track path
	const pathTrackGrid = []; // [ row = y ]
	for(let i = 0; i < pathfindGrid.length; i++) {
		pathTrackGrid.push([]);
		for(const cell of pathfindGrid[0]) pathTrackGrid[i].push(null);
	}

	pathfindGrid[s[1]][s[0]] = visitedSymbol;
	const queue = []
	queue.push([ s[0], s[1] ]);

	const loop = () => {
	
		// possible return values: 
			// 'no path'
			// nei

		const node = queue.shift();
		if(!node) return 'no path';
		const directions = [ [0,1], [1,0],  [-1,0],  [0,-1] ,[1,1],[1,-1],[-1,-1],[-1,1] ];
		const neighbors = [];

		for(const dir of directions) {
			const xNei = node[0] + dir[0];
			const yNei = node[1] + dir[1];
			if(xNei < 0 || xNei >= pathfindGrid[0].length) continue
			if(yNei < 0 || yNei >= pathfindGrid.length) continue
			neighbors.push([ xNei, yNei ])
		}

		pathfindGrid[node[1]][node[0]] = visitedSymbol;

		for(const nei of neighbors) {

			// if neighbor is diagonal to node, and there is obstacle in area, do not consider as neighbor
			const diag1 = pathfindGrid[node[1]][nei[0]];
			const diag2 = pathfindGrid[nei[1]][node[0]];
			if(diag1 === wallSymbol || diag2 === wallSymbol) {
				continue;
			}

			const row = pathfindGrid[nei[1]];
			const prevRow = pathTrackGrid[nei[1]];

			if(row[nei[0]] === destSymbol) {
				prevRow[nei[0]] = node;
				return nei;
			}

			if(row[nei[0]] !== pathSymbol) continue;
			row[nei[0]] = queuedSymbol;
			queue.push([ nei[0], nei[1] ]);
			prevRow[nei[0]] = node;

			// console.log( pathfindGrid.map( row => row.join(' ') ).join('\n') );
			//await new Promise(r => setTimeout(r, 300));

		}

	}

	let found;
	while(!found) {
		found = loop();
	}
	
	if(found === 'no path') return found;
	
	const reconstructFromPathTrackGrid = end => {
		// end: [x, y]
		const route = [];
		let cur = end;
		while(cur) {
			if( pathTrackGrid[ cur[1] ][ cur[0] ] ) route.unshift(cur);
			cur = pathTrackGrid[ cur[1] ][ cur[0] ];
		}
		return route;
	}
	
	const simplified = simplifyGridPath( reconstructFromPathTrackGrid(found) ) 

	return simplified;
		
}


