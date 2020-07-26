let searchController = {};

searchController.nodes;
searchController.fh;
searchController.fhf;
searchController.depth;
searchController.time;
searchController.start;
searchController.stop;
searchController.best;
searchController.thinking;

function pickNextMove(moveNumber) {

	let index = 0;
	let bestScore = -1;
	let bestNum = moveNumber;
	
	for(index = moveNumber; index < gameBoard.moveListStart[gameBoard.ply+1]; ++index) {
		if(gameBoard.moveScores[index] > bestScore) {
			bestScore = gameBoard.moveScores[index];
			bestNum = index;			
		}
	} 
	
	if(bestNum !== moveNumber) {
		let temp = 0;
		temp = gameBoard.moveScores[moveNumber];
		gameBoard.moveScores[moveNumber] = gameBoard.moveScores[bestNum];
		gameBoard.moveScores[bestNum] = temp;
		
		temp = gameBoard.moveList[moveNumber];
		gameBoard.moveList[moveNumber] = gameBoard.moveList[bestNum];
		gameBoard.moveList[bestNum] = temp;
	}

}

function clearPvTable() {
	for(index = 0; index < pvEntries; index++) {
			gameBoard.pvTable[index].move = noMove;
			gameBoard.pvTable[index].positionKey = 0;		
	}
}

function checkUp() {
	if (( $.now() - searchController.start ) > searchController.time) {
		searchController.stop = true;
	}
}

function isRepetition() {
	let index = 0;
	
	for(index = gameBoard.hisPly - gameBoard.fiftyMove; index < gameBoard.hisPly - 1; ++index) {
		if(gameBoard.positionKey === gameBoard.history[index].positionKey) {
			return true;
		}
	}
	
	return false;
}

function quiescence(alpha, beta) {

	if ((searchController.nodes % 2048) === 0) {
		checkUp();
	}
	
	searchController.nodes++;
	
	if( (isRepetition() || gameBoard.fiftyMove >= 100) && gameBoard.ply !== 0) {
		return 0;
	}
	
	if(gameBoard.ply > maxDepth -1) {
		return evalPosition();
	}	
	
	let score = evalPosition();
	
	if(score >= beta) {
		return beta;
	}
	
	if(score > alpha) {
		alpha = score;
	}
	
	generateCaptures();
	
	let moveNumber = 0;
	let legal = 0;
	let oldAlpha = alpha;
	let bestMove = noMove;
	let move = noMove;	
	
	for(moveNumber = gameBoard.moveListStart[gameBoard.ply]; moveNumber < gameBoard.moveListStart[gameBoard.ply + 1]; ++moveNumber) {
	
		pickNextMove(moveNumber);
		
		move = gameBoard.moveList[moveNumber];	

		if(makeMove(move) === false) {
			continue;
		}		
		legal++;
		score = -quiescence( -beta, -alpha);
		
		takeMove();
		
		if(searchController.stop === true) {
			return 0;
		}
		
		if(score > alpha) {
			if(score >= beta) {
				if(legal === 1) {
					searchController.fhf++;
				}
				searchController.fh++;	
				return beta;
			}
			alpha = score;
			bestMove = move;
		}		
	}
	
	if(alpha !== oldAlpha) {
		storePvMove(bestMove);
	}
	
	return alpha;

}

function alphaBeta(alpha, beta, depth) {

	
	if(depth <= 0) {
		return quiescence(alpha, beta);
	}
	
	if ((searchController.nodes % 2048) === 0) {
		checkUp();
	}
	
	searchController.nodes++;
	
	if( (isRepetition() || gameBoard.fiftyMove >= 100) && gameBoard.ply !== 0) {
		return 0;
	}
	
	if(gameBoard.ply > maxDepth -1) {
		return evalPosition();
	}	
	
	let inCheck = squareAttacked(gameBoard.pieceList[pieceIndex(kings[gameBoard.side],0)], gameBoard.side^1);
	if(inCheck === true)  {
		depth++;
	}	
	
	let score = -infinite;
	
	generateMoves();
	
	let moveNumber = 0;
	let legal = 0;
	let oldAlpha = alpha;
	let bestMove = noMove;
	let move = noMove;	
	
	let pvMove = probePvTable();
	if(pvMove !== noMove) {
		for(moveNumber = gameBoard.moveListStart[gameBoard.ply]; moveNumber < gameBoard.moveListStart[gameBoard.ply + 1]; ++moveNumber) {
			if(gameBoard.moveList[moveNumber] === pvMove) {
				gameBoard.moveScores[moveNumber] = 2000000;
				break;
			}
		}
	}
	
	for(moveNumber = gameBoard.moveListStart[gameBoard.ply]; moveNumber < gameBoard.moveListStart[gameBoard.ply + 1]; ++moveNumber) {
	
		pickNextMove(moveNumber);	
		
		move = gameBoard.moveList[moveNumber];	
		
		if(makeMove(move) === false) {
			continue;
		}		
		legal++;
		score = -alphaBeta( -beta, -alpha, depth-1);
		
		takeMove();
		
		if(searchController.stop === true) {
			return 0;
		}
		
		if(score > alpha) {
			if(score >= beta) {
				if(legal === 1) {
					searchController.fhf++;
				}
				searchController.fh++;		
				if((move & moveFlagCapture) === 0) {
					gameBoard.searchKillers[maxDepth + gameBoard.ply] = 
						gameBoard.searchKillers[gameBoard.ply];
					gameBoard.searchKillers[gameBoard.ply] = move;
				}					
				return beta;
			}
			if((move & moveFlagCapture) === 0) {
				gameBoard.searchHistory[gameBoard.pieces[fromSquare(move)] * boardSquareNumber + toSquare(move)]
						 += depth * depth;
			}
			alpha = score;
			bestMove = move;				
		}		
	}	
	
	if(legal === 0) {
		if(inCheck === true) {
			return -mate + gameBoard.ply;
		} else {
			return 0;
		}
	}	
	
	if(alpha !== oldAlpha) {
		storePvMove(bestMove);
	}
	
	return alpha;
}

function clearForSearch() {

	let index = 0;
	
	for(index = 0; index < 14 * boardSquareNumber; ++index) {				
		gameBoard.searchHistory[index] = 0;	
	}
	
	for(index = 0; index < 3 * maxDepth; ++index) {
		gameBoard.searchKillers[index] = 0;
	}	
	
	clearPvTable();
	gameBoard.ply = 0;
	searchController.nodes = 0;
	searchController.fh = 0;
	searchController.fhf = 0;
	searchController.start = $.now();
	searchController.stop = false;
}

function searchPosition() {

	let bestMove = noMove;
	let bestScore = -infinite;
	let score = -infinite;
	let currentDepth = 0;
	let line;
	let pvNum;
	let c;
	clearForSearch();

	searchController.depth = $('#depthInput').val();
	
	for( currentDepth = 1; currentDepth <= searchController.depth; ++currentDepth) {	
	
		score = alphaBeta(-infinite, infinite, currentDepth);
					
		if(searchController.stop === true) {
			break;
		}
		
		bestScore = score; 
		bestMove = probePvTable();
		line = 'D:' + currentDepth + ' Best:' + printMove(bestMove) + ' score:' + bestScore + 
				' nodes:' + searchController.nodes;
				
		pvNum = getPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < pvNum; ++c) {
			line += ' ' + printMove(gameBoard.pvArray[c]);
		}
		if(currentDepth!==1) {
			line += (" Ordering:" + ((searchController.fhf/searchController.fh)*100).toFixed(2) + "%");
		}
		console.log(line);
						
	}	

	searchController.best = bestMove;
	searchController.thinking = false;
	updateDOMStats(bestScore, currentDepth);
}

function updateDOMStats(domScore, domDepth) {

	let scoreText = "Score: " + (domScore / 100).toFixed(2);
	if(Math.abs(domScore) > mate - maxDepth) {
		scoreText = "Score: Mate In " + (mate - (Math.abs(domScore))-1) + " moves";
	}

	let square = fromSquare(searchController.best);
	let piece = gameBoard.pieces[square]
	
	$("#depthOutput").text("Depth: " + domDepth);
	$("#scoreOutput").text(scoreText);
	$("#nodesOutput").text("Nodes: " + searchController.nodes);
	$("#timeOutput").text("Time: " + (($.now()-searchController.start)/1000).toFixed(1) + "s");
	$("#bestOutput").text("Best move: " + pieceChar[piece] + printMove(searchController.best));
}