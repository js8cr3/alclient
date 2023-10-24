import { followLeaderStrategy, aggroKiteStrategy } from './manouverStrategies.js'
import { randomNum, createGrid, transformGridPathToCoor, translatePositionToGridCoor, markObstacles, consoleDisplayGrid, markCorners } from './utils.js'
import { gridUnit, obstacleSymbol, obstacleList, symbolB } from './settings.js'

export { manouver };

function manouver(nodes, boundary, strategyType) {

	// strategyType: 'aggroKiteStrategy', 'followLeaderStrategy'
	if( strategyType !== 'aggroKiteStrategy' && strategyType !== 'followLeaderStrategy' ) throw new Error('No valid strategy given');
	if(!nodes) throw new Error('No nodes given');
	if(!boundary) throw new Error('No boundary given');

	// possible values:
		// 'outside boundary'
		// 'move towards target'
		// 'no path'
		// 'arrived'

	const moveOpt = {disableSafetyCheck: true,disableErrorLogs: true};

	if(this.unstucking) return 'unstucking';
		
	const currentNodes = this.transformNodes(nodes, boundary);
	const pathfindGrid = createGrid(currentNodes);
	markCorners(pathfindGrid, symbolB, 2);
	markObstacles(pathfindGrid, obstacleSymbol, obstacleList);
	// consoleDisplayGrid(pathfindGrid);

	// pathfinding
	
	const start = translatePositionToGridCoor(
		[this.x, this.y], boundary, gridUnit
	);
	if(!start) {
		this.move((boundary[0]+boundary[2])/2, (boundary[1]+boundary[3])/2, moveOpt).catch(()=>{})
		return 'outside boundary';
	}

	let gridPath;
	if(strategyType === 'aggroKiteStrategy') {
		gridPath = this.aggroKiteStrategy(pathfindGrid, start, this.range * 0.9)
	} else if (strategyType === 'followLeaderStrategy') {
		gridPath = this.followLeaderStrategy(pathfindGrid, start, boundary, gridUnit)
	}
	 
	if(gridPath === 'stuck in obstacle') {
		this.unstucking = true;
		setTimeout( () => this.unstucking = false, 333);
		this.move(this.x + randomNum(-30, 30), this.y + randomNum(-30, 30), moveOpt)
		.catch(()=>{})
		return gridPath;
	}
	if(gridPath === 'outside attack range') {
		const targetedMonster = this.getTargetEntity();
		this.move(targetedMonster.x, targetedMonster.y, moveOpt)
		.catch(()=>{})
		return gridPath;
	}
	if(
		gridPath === 'no path' || 
		gridPath === 'target to follow does not exist' || 
		gridPath === 'arrived'
	) return gridPath;

	const pathToDestination = transformGridPathToCoor(gridPath, boundary, gridUnit);

	const moveByPath = async () => {
		for(const point of pathToDestination) {
			let moveSuccess;
			const moveData = await this.move(point[0], point[1], moveOpt)
				.then( () => moveSuccess = true )
				.catch(()=>{});
			if(!moveSuccess) break;
		}
	}

	moveByPath();

}




