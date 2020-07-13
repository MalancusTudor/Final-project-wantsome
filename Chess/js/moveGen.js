let MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
let MvvLvaScores = new Array(14 * 14);

function initMvvLva() {
	let attacker;
	let victim;
	
	for(attacker = pieces.wP; attacker <= pieces.bK; ++attacker) {
		for(victim = pieces.wP; victim <= pieces.bK; ++victim) {
			MvvLvaScores[victim * 14 + attacker] = MvvLvaValue[victim] + 6 - (MvvLvaValue[attacker]/100);
		}
	}

}

function moveExists(move) {
	
	generateMoves();
    
	let index;
	let moveFound = noMove;
	for(index = gameBoard.moveListStart[gameBoard.ply]; index < gameBoard.moveListStart[gameBoard.ply + 1]; ++index) {
	
		moveFound = gameBoard.moveList[index];	
		if(makeMove(moveFound) === false) {
			continue;
		}				
		takeMove();
		if(move === moveFound) {
			return true;
		}
	}
	return false;
}

function moveShift(from, to, captured, promoted, flag) {
	return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function addCaptureMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply+1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply+1]++] =  
		MvvLvaScores[capturedSquare(move) * 14 + gameBoard.pieces[fromSquare(move)]] + 1000000;	
}

function addQuietMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply+1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply+1]] =  0;
	
	if(move === gameBoard.searchKillers[gameBoard.ply]) {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply+1]] = 900000;
	} else if(move === gameBoard.searchKillers[gameBoard.ply + maxDepth]) {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply+1]] = 800000;
	} else {
		gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply+1]] = 
			gameBoard.searchHistory[gameBoard.pieces[fromSquare(move)] * boardSquareNumber + toSquare(move)];
	}
	
	gameBoard.moveListStart[gameBoard.ply+1]++;
}

function addEnPassantMove(move) {
	gameBoard.moveList[gameBoard.moveListStart[gameBoard.ply+1]] = move;
	gameBoard.moveScores[gameBoard.moveListStart[gameBoard.ply + 1]++] = 105 + 1000000;
}

function addWhitePawnCaptureMove(from, to, cap) {
	if(ranksBoard[from]===ranks.rank7) {
		addCaptureMove(moveShift(from, to, cap, pieces.wQ, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.wR, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.wB, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.wN, 0));	
	} else {
		addCaptureMove(moveShift(from, to, cap, pieces.empty, 0));	
	}
}

function addBlackPawnCaptureMove(from, to, cap) {
	if(ranksBoard[from]===ranks.rank2) {
		addCaptureMove(moveShift(from, to, cap, pieces.bQ, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.bR, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.bB, 0));
		addCaptureMove(moveShift(from, to, cap, pieces.bN, 0));	
	} else {
		addCaptureMove(moveShift(from, to, cap, pieces.empty, 0));	
	}
}

function addWhitePawnQuietMove(from, to) {
	if(ranksBoard[from]===ranks.rank7) {
		addQuietMove(moveShift(from,to,pieces.empty,pieces.wQ,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.wR,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.wB,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.wN,0));
	} else {
		addQuietMove(moveShift(from,to,pieces.empty,pieces.empty,0));	
	}
}

function addBlackPawnQuietMove(from, to) {
	if(ranksBoard[from]===ranks.rank2) {
		addQuietMove(moveShift(from,to,pieces.empty,pieces.bQ,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.bR,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.bB,0));
		addQuietMove(moveShift(from,to,pieces.empty,pieces.bN,0));
	} else {
		addQuietMove(moveShift(from,to,pieces.empty,pieces.empty,0));	
	}
}

function generateMoves() {
	gameBoard.moveListStart[gameBoard.ply+1] = gameBoard.moveListStart[gameBoard.ply];
	
	let pceType;
	let pieceNumber;
	let sq;
	let pceIndex;
	let pce;
	let tSquare;
	let dir;
	
	if(gameBoard.side === colours.white) {
		pceType = pieces.wP;
		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pceType]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pceType, pieceNumber)];			
			if(gameBoard.pieces[sq + 10] === pieces.empty) {
				addWhitePawnQuietMove(sq, sq+10);
				if(ranksBoard[sq] === ranks.rank2 && gameBoard.pieces[sq + 20] === pieces.empty) {
					addQuietMove( moveShift(sq, sq + 20, pieces.empty, pieces.empty, moveFlagPawnStart ));
				}
			}
			
			if(squareOffBoard(sq + 9) === false && pieceColor[gameBoard.pieces[sq+9]] === colours.black) {
				addWhitePawnCaptureMove(sq, sq + 9, gameBoard.pieces[sq+9]);
			}
			
			if(squareOffBoard(sq + 11) === false && pieceColor[gameBoard.pieces[sq+11]] === colours.black) {
				addWhitePawnCaptureMove(sq, sq + 11, gameBoard.pieces[sq+11]);
			}			
			
			if(gameBoard.enPas !== squares.noSquare) {
				if(sq + 9 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq+9, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
				
				if(sq + 11 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq+11, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
			}			
			
		}
		
		if(gameBoard.castlePerm & castleBit.WKCA) {			
			if(gameBoard.pieces[squares.F1] === pieces.empty && gameBoard.pieces[squares.G1] === pieces.empty) {
				if(squareAttacked(squares.F1, colours.black) === false && squareAttacked(squares.E1, colours.black) === false) {
					addQuietMove( moveShift(squares.E1, squares.G1, pieces.empty, pieces.empty, moveFlagCastle ));
				}
			}
		}
		
		if(gameBoard.castlePerm & castleBit.WQCA) {
			if(gameBoard.pieces[squares.D1] === pieces.empty && gameBoard.pieces[squares.C1] === pieces.empty && gameBoard.pieces[squares.B1] === pieces.empty) {
				if(squareAttacked(squares.D1, colours.black) === false && squareAttacked(squares.E1, colours.black) === false) {
					addQuietMove( moveShift(squares.E1, squares.C1, pieces.empty, pieces.empty, moveFlagCastle ));
				}
			}
		}		

	} else {
		pceType = pieces.bP;
		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pceType]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pceType, pieceNumber)];
			if(gameBoard.pieces[sq - 10] === pieces.empty) {
				addBlackPawnQuietMove(sq, sq-10);		
				if(ranksBoard[sq] === ranks.rank7 && gameBoard.pieces[sq - 20] === pieces.empty) {
					addQuietMove( moveShift(sq, sq - 20, pieces.empty, pieces.empty, moveFlagPawnStart ));
				}
			}
			
			if(squareOffBoard(sq - 9) === false && pieceColor[gameBoard.pieces[sq-9]] === colours.white) {
				addBlackPawnCaptureMove(sq, sq - 9, gameBoard.pieces[sq-9]);
			}
			
			if(squareOffBoard(sq - 11) === false && pieceColor[gameBoard.pieces[sq-11]] === colours.white) {
				addBlackPawnCaptureMove(sq, sq - 11, gameBoard.pieces[sq-11]);
			}			
			
			if(gameBoard.enPas !== squares.noSquare) {
				if(sq - 9 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq-9, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
				
				if(sq - 11 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq-11, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
			}
		}
		if(gameBoard.castlePerm & castleBit.BKCA) {	
			if(gameBoard.pieces[squares.F8] === pieces.empty && gameBoard.pieces[squares.G8] === pieces.empty) {
				if(squareAttacked(squares.F8, colours.white) === false && squareAttacked(squares.E8, colours.white) === false) {
					addQuietMove( moveShift(squares.E8, squares.G8, pieces.empty, pieces.empty, moveFlagCastle ));
				}
			}
		}
		
		if(gameBoard.castlePerm & castleBit.BQCA) {
			if(gameBoard.pieces[squares.D8] === pieces.empty && gameBoard.pieces[squares.C8] === pieces.empty && gameBoard.pieces[squares.B8] === pieces.empty) {
				if(squareAttacked(squares.D8, colours.white) === false && squareAttacked(squares.E8, colours.white) === false) {
					addQuietMove(moveShift(squares.E8, squares.C8, pieces.empty, pieces.empty, moveFlagCastle));
				}
			}
		}	
	}	
	
	pceIndex = loopNonSlideIndex[gameBoard.side];
	pce = loopNonSlidePiece[pceIndex++];
	
	while (pce !== 0) {
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pce]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pce, pieceNumber)];
			
			for(index = 0; index < directionNumber[pce]; index++) {
				dir = pieceDirection[pce][index];
				tSquare = sq + dir;
				
				if(squareOffBoard(tSquare) === true) {
					continue;
				}
				
				if(gameBoard.pieces[tSquare] !== pieces.empty) {
					if(pieceColor[gameBoard.pieces[tSquare]] !== gameBoard.side) {
						addCaptureMove( moveShift(sq, tSquare, gameBoard.pieces[tSquare], pieces.empty, 0 ));
					}
				} else {
					addQuietMove( moveShift(sq, tSquare, pieces.empty, pieces.empty, 0 ));
				}
			}			
		}	
		pce = loopNonSlidePiece[pceIndex++];
	}
	
	pceIndex = loopSlideIndex[gameBoard.side];
	pce = loopSlidePiece[pceIndex++];
	
	while(pce !== 0) {		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pce]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pce, pieceNumber)];
			
			for(index = 0; index < directionNumber[pce]; index++) {
				dir = pieceDirection[pce][index];
				tSquare = sq + dir;
				
				while(squareOffBoard(tSquare) === false) {	
				
					if(gameBoard.pieces[tSquare] !== pieces.empty) {
						if(pieceColor[gameBoard.pieces[tSquare]] !== gameBoard.side) {
							addCaptureMove( moveShift(sq, tSquare, gameBoard.pieces[tSquare], pieces.empty, 0 ));
						}
						break;
					}
					addQuietMove( moveShift(sq, tSquare, pieces.empty, pieces.empty, 0 ));
					tSquare += dir;
				}
			}			
		}	
		pce = loopSlidePiece[pceIndex++];
	}
}

function generateCaptures() {
	gameBoard.moveListStart[gameBoard.ply+1] = gameBoard.moveListStart[gameBoard.ply];
	
	let pceType;
	let pieceNumber;
	let sq;
	let pceIndex;
	let pce;
	let tSquare;
	let dir;
	
	if(gameBoard.side === colours.white) {
		pceType = pieces.wP;
		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pceType]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pceType, pieceNumber)];				
			
			if(squareOffBoard(sq + 9) === false && pieceColor[gameBoard.pieces[sq+9]] === colours.black) {
				addWhitePawnCaptureMove(sq, sq + 9, gameBoard.pieces[sq+9]);
			}
			
			if(squareOffBoard(sq + 11) === false && pieceColor[gameBoard.pieces[sq+11]] === colours.black) {
				addWhitePawnCaptureMove(sq, sq + 11, gameBoard.pieces[sq+11]);
			}			
			
			if(gameBoard.enPas !== squares.noSquare) {
				if(sq + 9 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq+9, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
				
				if(sq + 11 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq+11, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
			}			
			
		}			

	} else {
		pceType = pieces.bP;
		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pceType]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pceType, pieceNumber)];			
			
			if(squareOffBoard(sq - 9) === false && pieceColor[gameBoard.pieces[sq-9]] === colours.white) {
				addBlackPawnCaptureMove(sq, sq - 9, gameBoard.pieces[sq-9]);
			}
			
			if(squareOffBoard(sq - 11) === false && pieceColor[gameBoard.pieces[sq-11]] === colours.white) {
				addBlackPawnCaptureMove(sq, sq - 11, gameBoard.pieces[sq-11]);
			}			
			
			if(gameBoard.enPas !== squares.noSquare) {
				if(sq - 9 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq-9, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
				
				if(sq - 11 === gameBoard.enPas) {
					addEnPassantMove( moveShift(sq, sq-11, pieces.empty, pieces.empty, moveFlagEnPas ) );
				}
			}
		}			
	}	
	
	pceIndex = loopNonSlideIndex[gameBoard.side];
	pce = loopNonSlidePiece[pceIndex++];
	
	while (pce !== 0) {
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pce]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pce, pieceNumber)];
			
			for(index = 0; index < directionNumber[pce]; index++) {
				dir = pieceDirection[pce][index];
				tSquare = sq + dir;
				
				if(squareOffBoard(tSquare) === true) {
					continue;
				}
				
				if(gameBoard.pieces[tSquare] !== pieces.empty) {
					if(pieceColor[gameBoard.pieces[tSquare]] !== gameBoard.side) {
						addCaptureMove( moveShift(sq, tSquare, gameBoard.pieces[tSquare], pieces.empty, 0 ));
					}
				}
			}			
		}	
		pce = loopNonSlidePiece[pceIndex++];
	}
	
	pceIndex = loopSlideIndex[gameBoard.side];
	pce = loopSlidePiece[pceIndex++];
	
	while(pce !== 0) {		
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[pce]; ++pieceNumber) {
			sq = gameBoard.pieceList[pieceIndex(pce, pieceNumber)];
			
			for(index = 0; index < directionNumber[pce]; index++) {
				dir = pieceDirection[pce][index];
				tSquare = sq + dir;
				
				while(squareOffBoard(tSquare) === false) {	
				
					if(gameBoard.pieces[tSquare] !== pieces.empty) {
						if(pieceColor[gameBoard.pieces[tSquare]] !== gameBoard.side) {
							addCaptureMove( moveShift(sq, tSquare, gameBoard.pieces[tSquare], pieces.empty, 0 ));
						}
						break;
					}
					tSquare += dir;
				}
			}			
		}	
		pce = loopSlidePiece[pceIndex++];
	}
}