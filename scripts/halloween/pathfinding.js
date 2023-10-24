export function pathfinding(start, destination, tree) {
	
	if(typeof tree !== 'object') throw new Error('Provide proper tree');

	const pathTracking = {};
	const visited = [];
	const queued = [start];

	while(queued.length) {

		const currentNode = queued[0];

		for(const node of tree[currentNode]) {

			const findCallback = value => value === node;
			if( queued.find(findCallback) || visited.find(findCallback) ) continue;

			queued.push(node);
			pathTracking[node] = currentNode;

		}

		visited.push(currentNode);
		queued.shift();

	};

	const path = [destination];
	
	for(let i = 0; i < 200; i++) { 		// index is just for preventing infinite loop
		if(path[0] === start) break;
		const nextNode = pathTracking[ path[0] ];
		if(!nextNode) break;
		path.unshift(nextNode);
	}

	if(path[0] !== start) return 'Path not found';
	console.log(path);
	return path;

}
