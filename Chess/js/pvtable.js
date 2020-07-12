function getPvLine(depth) {
	let move = probePvTable();
	let count = 0;
	
	while(move !== noMove && count < depth) {
	
		if( moveExists(move) === true) {
			makeMove(move);
			gameBoard.pvArray[count++] = move;			
		} else {
			break;
		}		
		move = probePvTable();	
	}
	
	while(gameBoard.ply > 0) {
		takeMove();
	}
	
	return count;
}

function probePvTable() {
	let index = gameBoard.positionKey % pvEntries;
	
	if(gameBoard.pvTable[index].positionKey === gameBoard.positionKey) {
		return gameBoard.pvTable[index].move;
	}
	
	return noMove;
}

function storePvMove(move) {
	let index = gameBoard.positionKey % pvEntries;
	gameBoard.pvTable[index].positionKey = gameBoard.positionKey;
	gameBoard.pvTable[index].move = move;
}