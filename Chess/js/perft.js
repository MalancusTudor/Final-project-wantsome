let perft_leafNodes;

function perft(depth) { 	

	if(depth === 0) {
        perft_leafNodes++;
        return;
    }	
    
    generateMoves();
    
	let index;
	let move;
	
	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
	
		move = gameBoard.moveList[index];	
		if(makeMove(move) === false) {
			continue;
		}		
		perft(depth-1);
		takeMove();
	}
    
    return;
}

function perftTest(depth) {    

	printBoard();
	console.log("Starting Test To Depth:" + depth);	
	perft_leafNodes = 0;

	let index;
	let move;
	let moveNum = 0;
	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
	
		move = gameBoard.moveList[index];	
		if(makeMove(move) === false) {
			continue;
		}	
		moveNum++;	
        let cumnodes = perft_leafNodes;
		perft(depth-1);
		takeMove();
		let oldnodes = perft_leafNodes - cumnodes;
        console.log("move:" + moveNum + " " + printMove(move) + " " + oldnodes);
	}
    
	console.log("Test Complete : " + perft_leafNodes + " leaf nodes visited");      

    return;
}