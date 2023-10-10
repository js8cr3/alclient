import { visitedSymbol, queuedSymbol } from '../settings.js'
export default fill;

function fill(grid, s /* point in area */, path) {

	const deep = structuredClone(grid);
	const queue = [];
	const possibleDestList = [];

	deep[s[1]][s[0]] = visitedSymbol;
	queue.push([ s[0], s[1] ]);
	possibleDestList.push([ s[0], s[1] ]);

	const loop = () => {

		const node = queue.shift();
		if(!node) return 'done';
		const directions = [ [0,1], [1,0],  [-1,0],  [0,-1]];
		const neighbors = [];

		for(const dir of directions) {
			const xNei = node[0] + dir[0];
			const yNei = node[1] + dir[1];
			if(xNei < 0 || xNei >= deep[0].length) continue
			if(yNei < 0 || yNei >= deep.length) continue
			neighbors.push([ xNei, yNei ])
		}

		deep[node[1]][node[0]] = visitedSymbol;

		for(const nei of neighbors) {

			const row = deep[nei[1]];

			if(row[nei[0]] !== path) continue;
			row[nei[0]] = queuedSymbol;
			queue.push([ nei[0], nei[1] ]);
			possibleDestList.push([ nei[0], nei[1] ]);

		}

	}

	let done;
	while(!done) {
		done = loop();
	}
	
	return possibleDestList;

}



