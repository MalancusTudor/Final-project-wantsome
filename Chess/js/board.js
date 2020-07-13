let gameBoard = {};

gameBoard.pieces = new Array(boardSquareNumber);
gameBoard.side = colours.white;
gameBoard.fiftyMove = 0;
gameBoard.hisPly = 0;
gameBoard.history = [];
gameBoard.ply = 0;
gameBoard.enPas = 0;
gameBoard.castlePerm = 0;
gameBoard.material = new Array(2); // white,black material of pieces
gameBoard.pieceNumber = new Array(13); // indexed by Pce
gameBoard.pieceList = new Array(14 * 10);
gameBoard.positionKey = 0;
gameBoard.moveList = new Array(maxDepth * maxPositionMoves);
gameBoard.moveScores = new Array(maxDepth * maxPositionMoves);
gameBoard.moveListStart = new Array(maxDepth);
gameBoard.pvTable = [];
gameBoard.pvArray = new Array(maxDepth);
gameBoard.searchHistory = new Array( 14 * boardSquareNumber);
gameBoard.searchKillers = new Array(3 * maxDepth);



function checkBoard() {   
 
	let tPieceNumber = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	let tMaterial = [ 0, 0];
	let sq64, tPiece, tPceNum, sq120;
	
	for(tPiece = pieces.wP; tPiece <= pieces.bK; ++tPiece) {
		for(tPceNum = 0; tPceNum < gameBoard.pieceNumber[tPiece]; ++tPceNum) {
			sq120 = gameBoard.pieceList[pieceIndex(tPiece,tPceNum)];
			if(gameBoard.pieces[sq120] !== tPiece) {
				console.log('Error Pce Lists');
				return false;
			}
		}	
	}
	
	for(sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = square120(sq64);
		tPiece = gameBoard.pieces[sq120];
		tPieceNumber[tPiece]++;
		tMaterial[pieceColor[tPiece]] += pieceValue[tPiece];
	}
	
	for(tPiece = pieces.wP; tPiece <= pieces.bK; ++tPiece) {
		if(tPieceNumber[tPiece] !== gameBoard.pieceNumber[tPiece]) {
				console.log('Error tPieceNumber');
				return false;
			}	
	}
	
	if(tMaterial[colours.white] !== gameBoard.material[colours.white] ||
			 tMaterial[colours.black] !== gameBoard.material[colours.black]) {
				console.log('Error tMaterial');
				return false;
	}	
	
	if(gameBoard.side!==colours.white && gameBoard.side!==colours.black) {
				console.log('Error gameBoard.side');
				return false;
	}
	
	if(generatePositionKey()!==gameBoard.positionKey) {
				console.log('Error gameBoard.positionKey');
				return false;
	}	
	return true;
}

function printBoard() {
	
	let sq,file,rank,piece;

	console.log("\nGame board:\n");
	for(rank = ranks.rank8; rank >= ranks.rank1; rank--) {
		let line =(rankChar[rank] + "  ");
		for(file = files.fileA; file <= files.fileH; file++) {
			sq = fileRankToSquare(file,rank);
			piece = gameBoard.pieces[sq];
			line += (" " + pieceChar[piece] + " ");
		}
		console.log(line);
	}
	
	console.log("");
	let line = "   ";
	for(file = files.fileA; file <= files.fileH; file++) {
		line += (' ' + fileChar[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + sideChar[gameBoard.side] );
	console.log("enPas:" + gameBoard.enPas);
	line = "";	
	
	if(gameBoard.castlePerm & castleBit.WKCA) line += 'K';
	if(gameBoard.castlePerm & castleBit.WQCA) line += 'Q';
	if(gameBoard.castlePerm & castleBit.BKCA) line += 'k';
	if(gameBoard.castlePerm & castleBit.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + gameBoard.positionKey.toString(16));
}

function generatePositionKey() {

	let sq = 0;
	let finalKey = 0;
	let piece = pieces.empty;

	for(sq = 0; sq < boardSquareNumber; ++sq) {
		piece = gameBoard.pieces[sq];
		if(piece !== pieces.empty && piece !== squares.offBoard) {			
			finalKey ^= pieceKeys[(piece * 120) + sq];
		}		
	}

	if(gameBoard.side === colours.white) {
		finalKey ^= sideKey;
	}
	
	if(gameBoard.enPas !== squares.noSquare) {		
		finalKey ^= pieceKeys[gameBoard.enPas];
	}
	
	finalKey ^= castleKeys[gameBoard.castlePerm];
	
	return finalKey;

}

function printPieceLists() {

	let piece, pieceNumber;
	
	for(piece = pieces.wP; piece <= pieces.bK; ++piece) {
		for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
			console.log('piece ' + pieceChar[piece] + ' on ' + printSquare( gameBoard.pieceList[pieceIndex(piece,pieceNumber)] ));
		}
	}

}

function updateListsMaterial() {	
	
	let piece,sq,index,color;
	
	for(index = 0; index < 14 * 120; ++index) {
		gameBoard.pieceList[index] = pieces.empty;
	}
	
	for(index = 0; index < 2; ++index) {		
		gameBoard.material[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		gameBoard.pieceNumber[index] = 0;
	}
	
	for(index = 0; index < 64; ++index) {
		sq = square120(index);
		piece = gameBoard.pieces[sq];
		if(piece !== pieces.empty) {
			
			color = pieceColor[piece];		
			
			gameBoard.material[color] += pieceValue[piece];
			
			gameBoard.pieceList[pieceIndex(piece,gameBoard.pieceNumber[piece])] = sq;
			gameBoard.pieceNumber[piece]++;			
		}
	}
	
}

function resetBoard() {
	
	let index = 0;
	
	for(index = 0; index < boardSquareNumber; ++index) {
		gameBoard.pieces[index] = squares.offBoard;
	}
	
	for(index = 0; index < 64; ++index) {
		gameBoard.pieces[square120(index)] = pieces.empty;
	}
	
	gameBoard.side = colours.both;
	gameBoard.enPas = squares.noSquare;
	gameBoard.fiftyMove = 0;	
	gameBoard.ply = 0;
	gameBoard.hisPly = 0;	
	gameBoard.castlePerm = 0;	
	gameBoard.positionKey = 0;
	gameBoard.moveListStart[gameBoard.ply] = 0;
	
}


function parseFen(fen) {

	resetBoard();
	
	let rank = ranks.rank8;
    let file = files.fileA;
    let piece = 0;
    let count = 0;
    let i = 0;  
	let sq120 = 0;
	let fenCnt = 0;
	
	while ((rank >= ranks.rank1) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = pieces.bP; break;
            case 'r': piece = pieces.bR; break;
            case 'n': piece = pieces.bN; break;
            case 'b': piece = pieces.bB; break;
            case 'k': piece = pieces.bK; break;
            case 'q': piece = pieces.bQ; break;
            case 'P': piece = pieces.wP; break;
            case 'R': piece = pieces.wR; break;
            case 'N': piece = pieces.wN; break;
            case 'B': piece = pieces.wB; break;
            case 'K': piece = pieces.wK; break;
            case 'Q': piece = pieces.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = pieces.empty;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank--;
                file = files.fileA;
                fenCnt++;
                continue;  
            default:
                console.log("FEN error");
                return;

		}
		
		for (i = 0; i < count; i++) {	
			sq120 = fileRankToSquare(file,rank);            
            gameBoard.pieces[sq120] = piece;
			file++;
        }
		fenCnt++;
	}
	
	gameBoard.side = (fen[fenCnt] === 'w') ? colours.white : colours.black;
	fenCnt += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === ' ') {
            break;
        }		
		switch(fen[fenCnt]) {
			case 'K': gameBoard.castlePerm |= castleBit.WKCA; break;
			case 'Q': gameBoard.castlePerm |= castleBit.WQCA; break;
			case 'k': gameBoard.castlePerm |= castleBit.BKCA; break;
			case 'q': gameBoard.castlePerm |= castleBit.BQCA; break;
			default:	     break;
        }
		fenCnt++;
	}
	fenCnt++;	
	
	if (fen[fenCnt] !== '-') {        
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();	
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);	
		gameBoard.enPas = fileRankToSquare(file,rank);		
    }
	
	gameBoard.positionKey = generatePositionKey();	
	updateListsMaterial();
}

function printSquareAttacked() {
	
	let sq,file,rank,piece;

	console.log("\nAttacked:\n");
	
	for(rank = ranks.rank8; rank >= ranks.rank1; rank--) {
		let line =((rank+1) + "  ");
		for(file = files.fileA; file <= files.fileH; file++) {
			sq = fileRankToSquare(file,rank);
			if(squareAttacked(sq, gameBoard.side^1) === true) piece = "X";
			else piece = "-";
			line += (" " + piece + " ");
		}
		console.log(line);
	}
	
	console.log("");
	
}

function squareAttacked(sq, side) {
	let piece;
	let tSquare;
	let index;
	
	if(side === colours.white) {
		if(gameBoard.pieces[sq - 11] === pieces.wP || gameBoard.pieces[sq - 9] === pieces.wP) {
			return true;
		}
	} else {
		if(gameBoard.pieces[sq + 11] === pieces.bP || gameBoard.pieces[sq + 9] === pieces.bP) {
			return true;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		piece = gameBoard.pieces[sq + knightDirection[index]];
		if(piece !== squares.offBoard && pieceColor[piece] === side && pieceKnight[piece] === true) {
			return true;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = rookDirection[index];
		tSquare = sq + dir;
		piece = gameBoard.pieces[tSquare];
		while(piece !== squares.offBoard) {
			if(piece !== pieces.empty) {
				if(pieceRookQueen[piece] === true && pieceColor[piece] === side) {
					return true;
				}
				break;
			}
			tSquare += dir;
			piece = gameBoard.pieces[tSquare];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = bishopDirection[index];
		tSquare = sq + dir;
		piece = gameBoard.pieces[tSquare];
		while(piece !== squares.offBoard) {
			if(piece !== pieces.empty) {
				if(pieceBishopQueen[piece] === true && pieceColor[piece] === side) {
					return true;
				}
				break;
			}
			tSquare += dir;
			piece = gameBoard.pieces[tSquare];
		}
	}
	
	for(index = 0; index < 8; index++) {
		piece = gameBoard.pieces[sq + kingDirection[index]];
		if(piece !== squares.offBoard && pieceColor[piece] === side && pieceKing[piece] === true) {
			return true;
		}
	}
	
	return false;
}





































































