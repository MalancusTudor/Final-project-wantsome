function printSquare(sq) {
	return (fileChar[filesBoard[sq]] + rankChar[ranksBoard[sq]]);
}

function printMove(move) {	
	let moveString;
	
	let ff = filesBoard[fromSquare(move)];
	let rf = ranksBoard[fromSquare(move)];
	let ft = filesBoard[toSquare(move)];
	let rt = ranksBoard[toSquare(move)];
	
	moveString = fileChar[ff] + rankChar[rf] + fileChar[ft] + rankChar[rt];
	
	let promoted = promotedSquare(move);

	if(promoted !== pieces.empty) {
		let pchar = 'q';
		if(pieceKnight[promoted] === true) {
			pchar = 'n';
		} else if(pieceRookQueen[promoted] === true && pieceBishopQueen[promoted] === false)  {
			pchar = 'r';
		} else if(pieceRookQueen[promoted] === false && pieceBishopQueen[promoted] === true)   {
			pchar = 'b';
		}
		moveString += pchar;
	}
	return moveString;
}

function printMoveList() {

	let index;
	let move;
	let num = 1;
	console.log('MoveList:');

	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply+1]; ++index) {
		move = gameBoard.moveList[index];
		console.log('IMove:' + num + ':(' + index + '):' + printMove(move) + ' Score:' +  gameBoard.moveScores[index]);
		num++;
	}
	console.log('End MoveList');
}

function parseMove(from, to) {

	generateMoves();
	
	let move = noMove;
	let promotionPiece = pieces.empty;
	let found = false;
	
	for(index = gameBoard.moveListStart[gameBoard.ply]; 
							index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {	
		move = gameBoard.moveList[index];
		if(fromSquare(move) === from && toSquare(move) === to) {
			promotionPiece = promotedSquare(move);
			if(promotionPiece !== pieces.empty) {
				if( (promotionPiece === pieces.wQ && gameBoard.side === colours.white) ||
					(promotionPiece === pieces.bQ && gameBoard.side === colours.black) ) {
					found = true;
					break;
				}
				continue;
			}
			found = true;
			break;
		}		
	}
	
	if(found !== false) {
		if(makeMove(move) === false) {
			return noMove;
		}
		takeMove();
		return move;
	}
	
	return noMove;
}