const gridUnit = 20;
const monsterData = ['wolfie', 'winterland'];

const [
	pathSymbol,
	wallSymbol,
	destSymbol, 
	obstacleSymbol,
	visitedSymbol, 
	queuedSymbol
] = ['\'', '>', 'Q', '■', 'v', 'q'];

const [
	symbolA,
	symbolB,
	symbolC,
	symbolD
] = ['\'', '>', 'e', 'B'];

const obstacleList = [
	/*
	[12,9],[13,9],
	[2,10],[3,10],[4,10],
	[2,11],[4,11],
	[2,12],[3,12],[4,12],
	[6,13],[7,13],
	[18,16],[19,16],[20,16]
	*/
	[9,7],[10,7],
	[22,9],[23,9],
	[7,11],[8,11],
	[7,12],[8,12],
	[16,14],[17,14],[18,14]
]

export { 
		gridUnit,
		monsterData,
		pathSymbol, wallSymbol, destSymbol, obstacleSymbol, visitedSymbol, queuedSymbol,
		symbolA, symbolB, symbolC, symbolD,
		obstacleList
}
