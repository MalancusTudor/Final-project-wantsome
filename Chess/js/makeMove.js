function clearPiece(square) {

	let piece = gameBoard.pieces[square];
	let color = pieceColor[piece];
	let index;
	let tPieceNumber = -1;
	
	hashPiece(piece, square);
	
	gameBoard.pieces[square] = pieces.empty;
	gameBoard.material[color] -= pieceValue[piece];
	
	for(index = 0; index < gameBoard.pieceNumber[piece]; ++index) {
		if(gameBoard.pieceList[pieceIndex(piece,index)] === square) {
			tPieceNumber = index;
			break;
		}
	}
	
	gameBoard.pieceNumber[piece]--;
	gameBoard.pieceList[pieceIndex(piece, tPieceNumber)] = gameBoard.pieceList[pieceIndex(piece, gameBoard.pieceNumber[piece])];	

}

function addPiece(square, piece) {

	let color = pieceColor[piece];
	
	hashPiece(piece, square);
	
	gameBoard.pieces[square] = piece;
	gameBoard.material[color] += pieceValue[piece];
	gameBoard.pieceList[pieceIndex(piece, gameBoard.pieceNumber[piece])] = square;
	gameBoard.pieceNumber[piece]++;

}

function movePiece(from, to) {
	
	let index = 0;
	let piece = gameBoard.pieces[from];
	
	hashPiece(piece, from);
	gameBoard.pieces[from] = pieces.empty;
	
	hashPiece(piece,to);
	gameBoard.pieces[to] = piece;
	
	for(index = 0; index < gameBoard.pieceNumber[piece]; ++index) {
		if(gameBoard.pieceList[pieceIndex(piece,index)] === from) {
			gameBoard.pieceList[pieceIndex(piece,index)] = to;
			break;
		}
	}
	
}

function makeMove(move) {
	
	let from = fromSquare(move);
    let to = toSquare(move);
    let side = gameBoard.side;	

	gameBoard.history[gameBoard.hisPly].positionKey = gameBoard.positionKey;

	if( (move & moveFlagEnPas) !== 0) {
		if(side === colours.white) {
			clearPiece(to-10);
		} else {
			clearPiece(to+10);
		}
	} else if( (move & moveFlagCastle) !== 0) {
		switch(to) {
			case squares.C1:
                movePiece(squares.A1, squares.D1);
			break;
            case squares.C8:
                movePiece(squares.A8, squares.D8);
			break;
            case squares.G1:
                movePiece(squares.H1, squares.F1);
			break;
            case squares.G8:
                movePiece(squares.H8, squares.F8);
			break;
            default: break;
		}
	}
	
	if(gameBoard.enPas !== squares.noSquare) hashEnPas();
	hashCastle();
	
	gameBoard.history[gameBoard.hisPly].move = move;
    gameBoard.history[gameBoard.hisPly].fiftyMove = gameBoard.fiftyMove;
    gameBoard.history[gameBoard.hisPly].enPas = gameBoard.enPas;
    gameBoard.history[gameBoard.hisPly].castlePerm = gameBoard.castlePerm;
    
    gameBoard.castlePerm &= castlePerm[from];
    gameBoard.castlePerm &= castlePerm[to];
    gameBoard.enPas = squares.noSquare;
    
    hashCastle();
    
    let captured = capturedSquare(move);
    gameBoard.fiftyMove++;
    
    if(captured !== pieces.empty) {
        clearPiece(to);
        gameBoard.fiftyMove = 0;
    }
    
    gameBoard.hisPly++;
	gameBoard.ply++;
	
	if(piecePawn[gameBoard.pieces[from]] === true) {
        gameBoard.fiftyMove = 0;
        if( (move & moveFlagPawnStart) !== 0) {
            if(side===colours.white) {
                gameBoard.enPas=from+10;
            } else {
                gameBoard.enPas=from-10;
            }
            hashEnPas();
        }
    }
    
    movePiece(from, to);
    
    let prPce = promotedSquare(move);
    if(prPce !== pieces.empty)   {       
        clearPiece(to);
        addPiece(to, prPce);
    }
    
    gameBoard.side ^= 1;
    hashSide();
    
    if(squareAttacked(gameBoard.pieceList[pieceIndex(kings[side],0)], gameBoard.side))  {
         takeMove();
    	return false;
    }
    
    return true;
}

function takeMove() {
	
	gameBoard.hisPly--;
    gameBoard.ply--;
    
    let move = gameBoard.history[gameBoard.hisPly].move;
	let from = fromSquare(move);
    let to = toSquare(move);
    
    if(gameBoard.enPas !== squares.noSquare) hashEnPas();
    hashCastle();
    
    gameBoard.castlePerm = gameBoard.history[gameBoard.hisPly].castlePerm;
    gameBoard.fiftyMove = gameBoard.history[gameBoard.hisPly].fiftyMove;
    gameBoard.enPas = gameBoard.history[gameBoard.hisPly].enPas;
    
    if(gameBoard.enPas !== squares.noSquare) hashEnPas();
    hashCastle();
    
    gameBoard.side ^= 1;
    hashSide();
    
    if( (moveFlagEnPas & move) !== 0) {
        if(gameBoard.side === colours.white) {
            addPiece(to-10, pieces.bP);
        } else {
            addPiece(to+10, pieces.wP);
        }
    } else if( (moveFlagCastle & move) !== 0) {
        switch(to) {
        	case squares.C1: movePiece(squares.D1, squares.A1); break;
            case squares.C8: movePiece(squares.D8, squares.A8); break;
            case squares.G1: movePiece(squares.F1, squares.H1); break;
            case squares.G8: movePiece(squares.F8, squares.H8); break;
            default: break;
        }
    }
    
    movePiece(to, from);
    
    let captured = capturedSquare(move);
    if(captured !== pieces.empty) {      
        addPiece(to, captured);
    }
    
    if(promotedSquare(move) !== pieces.empty)   {        
        clearPiece(from);
        addPiece(from, (pieceColor[promotedSquare(move)] === colours.white ? pieces.wP : pieces.bP));
    }
    
}