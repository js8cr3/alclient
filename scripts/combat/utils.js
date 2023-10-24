export {
	createGrid,
	randomNum, 
	withinBoundary2D,
	withinSquareRange,
	withinRange,
	transformGridPathToCoor,
	translatePositionToGridCoor,
	simplifyGridPath,
	markObstacles,
	markCorners,
	closestCellToTarget,
	closestCellToCenter,
	initializeNodes,
	consoleDisplayGrid
}

function createGrid(nodes) {

	// nodes: {x: Number, y: Number, w: String}

	const posGrid = []; // record cell positions
	const grid = [];	// record cell type

	const whereToInsertX = (node, array /* as row */ ) => {
		for(let i = 0; i < array.length; i++) {
			if(node.x < array[i][0] /* row's nth cell's x coor */ ) {
				return i;
			}
		}
		return array.length;
	}

	const whereToInsertY = (node, array /* as grid */ ) => {
		for(let i = 0; i < array.length; i++) {
			if(node.y < array[i][0][1] /* grid's nth row's first cell's y coor */) {
				return i;
			}
		}
		return array.length;
	}

	const displaceArray = (firstToDisplace, array) => {
		if(firstToDisplace>= array.length) return;
		for(let i = array.length - 1; i >= firstToDisplace; i--) {
			array[i+1] = array[i];
			array[i] = undefined;
		}
		return true;
	}

	nodes.forEach( (node, i) => {

		// if there's nothing in posGrid, initialize posGrid and grid
		if(!posGrid.length) {
			posGrid.push([[node.x, node.y]]);
			grid.push([node.w]);
			return;
		}

		// look for the row with the same y-level as current node
		let yIndex;
		for(let i = 0; i < posGrid.length; i++) {
			if(node.y !== posGrid[i][0][1] /* row's first cell's y coor */ ) continue;
			yIndex = i;
			break;
		}

		// if a row with the same y-level as the node doesn't exist, create new row at the appropriate index
		if(typeof yIndex === 'undefined') {
			yIndex = whereToInsertY(node, posGrid);
			displaceArray(yIndex, posGrid);
			displaceArray(yIndex, grid);
			posGrid[yIndex] = [[node.x, node.y]];
			grid[yIndex] = [node.w];
			return;
		}

		const xIndex = whereToInsertX(node, posGrid[yIndex]);
		displaceArray(xIndex, posGrid[yIndex]);
		displaceArray(xIndex, grid[yIndex]);
		posGrid[yIndex][xIndex] = [node.x, node.y];
		grid[yIndex][xIndex] = node.w;

	} )

	return grid;

}

function randomNum(min, max) {
    const diff = max - min;
    return Math.random() * diff + min;
}

function withinBoundary2D(target, [x1, y1, x2, y2]) {
	// target: {x: Number, y: Number}
	if( target.x < x1 || target.x > x2 || target.y < y1 || target.y > y2 ) return false;
	return true;
}

function withinSquareRange(center, target, sideHalfLength) {
	const distX = Math.abs(center.x - target.x);
	const distY = Math.abs(center.y - target.y);
	if(distX < sideHalfLength && distY < sideHalfLength) {
		return true;
	}
	return false;
}

function withinRange(center, target, range) {
	if( !withinSquareRange(center, target, range) ) return false;
	const distX = Math.abs(center.x - target.x);
	const distY = Math.abs(center.y - target.y);
	const dist = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2) );
	if(dist < range) return true;
}

function transformGridPathToCoor(pathArray, boundary, gridUnit) {
	// topLeft: [x, y];
	return pathArray.map( ([x, y]) => [boundary[0] + x * gridUnit, boundary[1] + y * gridUnit] );
}

function translatePositionToGridCoor(position, boundary, gridUnit) {

    if( 
        position[0] < boundary[0] ||  
        position[0] > boundary[2] ||  
        position[1] < boundary[1] ||  
        position[1] > boundary[3] 
    ) return ;

	// find which cell is closest to position on 1D line
	const closestInLine = (pos, startingPoint, limit) => {
		let index;
		const points = []
		for(let i = startingPoint; i < limit; i += gridUnit) {
			points.push(i);
		}
		for(let i = 0; i < points.length; i++) {
			index = i;
			if( points[i+1] > pos ) break;
		}	
		if( 
			points[index+1] && 
			pos + gridUnit * 0.5 > points[index+1] 
		) return index + 1;
		return index;
	}

	return [
		closestInLine(position[0], boundary[0], boundary[2]), 
		closestInLine(position[1], boundary[1], boundary[3])
	]

}

function simplifyGridPath(gridPath) {
	// if 3 or more connected points form a parallel line, reduce the points to only the starting and end point 
	let copy = structuredClone(gridPath)
	arrayLoop: for(let i = 0; true; i++) {
	
		while(true) {
			if(copy.length < i + 3) break arrayLoop;
			const cur = copy[i]
			const nxt = copy[i+1]
			const nxt2 = copy[i+2]
			let parallel = false;
			if( cur[0] === nxt2[0] && cur[0] === nxt[0] ) parallel = true;
			if( cur[1] === nxt2[1] && cur[1] === nxt[1] ) parallel = true; 
			if(
				Math.abs(cur[0] - nxt2[0]) === Math.abs(cur[1] - nxt2[1]) &&
				Math.abs(cur[0] - nxt[0]) === Math.abs(cur[1] - nxt[1]) 
			) parallel = true;
			if(parallel) {
				copy.splice(i+1, 1);
			} else {
				break;
			}
		}
		
	}
	return copy;
}

function markObstacles(grid, obstacleSymbol, obstacleList) {
	for(const obstacle of obstacleList) {
		grid[obstacle[1]][obstacle[0]] = obstacleSymbol;
	}
}

function markCorners(grid, warningSymbol, size) {
	
	const onEdge = (index, length) => {
		if(index <= size - 1 || index >= length - size) return true;
		return false;
	}
	
	for(let i = 0; i < grid.length; i++) {
		for(let j = 0; j < grid[i].length; j++) {
			if( onEdge(i, grid.length) && onEdge(j, grid[i].length) ) {
			   grid[i][j] = warningSymbol;
			}
		}
	}
	
}

function closestCellToTarget(grid, area, targetCoor) {

	const current = {coor: null, distance: 999};
	for(const coor of area) {
		const xDist = Math.abs(coor[0] - targetCoor[0]);
		const yDist = Math.abs(coor[1] - targetCoor[1]);
		const distance = Math.sqrt( Math.pow(xDist, 2) + Math.pow(yDist, 2) );
		if(distance > current.distance) continue;
		current.coor = coor;
		current.distance = distance;
	}

	return current.coor;

}
function closestCellToCenter(grid, possibleDestList) {

	const current = {coor: null, distance: 999};
	for(const coor of possibleDestList) {
		const xCenter = grid[0].length / 2;
		const yCenter = grid.length / 2;
		const xDist = Math.abs(coor[0] - xCenter);
		const yDist = Math.abs(coor[1] - yCenter);
		const distance = Math.max(xDist, yDist);
		if(distance > current.distance) continue;
		current.coor = coor;
		current.distance = distance;
	}

	return current.coor;

}

function initializeNodes(boundary, gridUnit, symbol) {
	const nodes = [];
	for(let x = boundary[0]; x < boundary[2]; x += gridUnit) {
		for(let y = boundary[1]; y < boundary[3]; y += gridUnit) {
			nodes.push({x, y, w: symbol, q: 0})	
		}
	}
	return nodes;
}

function consoleDisplayGrid(grid) {
	console.log( grid.map( row => row.join('') ).join('\n') );
}
