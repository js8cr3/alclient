import { gridUnit, symbolA, symbolB, symbolC, symbolD, monsterData } from '../settings.js'
import { withinRange } from '../utils.js'

export { transformNodes };

function transformNodes(nodes, monsterBoundary) {

	const monsters = this.getMonstersByType(monsterData[0]);
	const nodesCP = structuredClone(nodes);

	const character = this
	monsters.forEach( monster => {
		
		nodesCP.forEach( node => {
		
			const paintNode = () => {
			
				if( 
					withinRange(monster, node, 100) &&
					!monster.target && 
					node.w !== symbolD
				) {
					node.w = symbolD;
				} else if (
					node.w !== symbolD &&
					node.w !== symbolC &&
					withinRange(monster, node, 120) && 
					!monster.target
				) {
					node.q++;
					if(node.q >= 2) node.w = symbolC;
				} 
				if (
					node.w === symbolA &&
					withinRange(monster, node, 120)
				) {
					node.w = symbolB;
				} 
				
			}
			
			const rows = [], columns = [];
			for(let i = monsterBoundary[0]; i < monsterBoundary[2]; i += gridUnit) {
				columns.push(i);
			}
			for(let i = monsterBoundary[1]; i < monsterBoundary[3]; i += gridUnit) {
				rows.push(i)
			}
			
			const safeColumns = [];
			for(let i = 0; i <= 0; i++) safeColumns.push(columns[i]);
			for(let i = columns.length - 1; i >= columns.length - 3; i--) 
				safeColumns.push(columns[i]);

			if(monster.target && monster.target === character.name) {
				paintNode();
			} else if (
					!safeColumns.find( element => node.x === element)
				) {
					paintNode();
				}
			
		} )
	} )

	return nodesCP;

}

