$(function() {
	init();
	console.log("Main Init Called");	
	newGame(startFEN);
	$('#fenInput').val(startFEN);
});

function initFilesRanksBoard() {
	
	let index = 0;
	let file = files.fileA;
	let rank = ranks.rank1;
	let sq = squares.A1;
	
	for(index = 0; index < boardSquareNumber; ++index) {
		filesBoard[index] = squares.offBoard;
		ranksBoard[index] = squares.offBoard;
	}
	
	for(rank = ranks.rank1; rank <= ranks.rank8; ++rank) {
		for(file = files.fileA; file <= files.fileH; ++file) {
			sq = fileRankToSquare(file,rank);
			filesBoard[sq] = file;
			ranksBoard[sq] = rank;
		}
	}
}

function initHashKeys() {
    let index = 0;
	
	for(index = 0; index < 14 * 120; ++index) {				
		pieceKeys[index] = rand32();
	}
	
	sideKey = rand32();
	
	for(index = 0; index < 16; ++index) {
		castleKeys[index] = rand32();
	}
}

function initSq120To64() {

	let index = 0;
	let file = files.fileA;
	let rank = ranks.rank1;
	let sq = squares.A1;
	let sq64 = 0;

	for(index = 0; index < boardSquareNumber; ++index) {
		sq120ToSq64[index] = 65;
	}
	
	for(index = 0; index < 64; ++index) {
		sq64ToSq120[index] = 120;
	}
	
	for(rank = ranks.rank1; rank <= ranks.rank8; ++rank) {
		for(file = files.fileA; file <= files.fileH; ++file) {
			sq = fileRankToSquare(file,rank);
			sq64ToSq120[sq64] = sq;
			sq120ToSq64[sq] = sq64;
			sq64++;
		}
	}

}

function initBoardVars() {

	let index = 0;
	for(index = 0; index < maxGameMoves; ++index) {
		gameBoard.history.push( {
			move : noMove,
			castlePerm : 0,
			enPas : 0,
			fiftyMove : 0,
			positionKey : 0
		});
	}	
	
	for(index = 0; index < pvEntries; ++index) {
		gameBoard.pvTable.push({
			move : noMove,
			positionKey : 0
		});
	}
}

function initBoardSquares() {
	let lightSquare = 1;
	let rankName;
	let fileName;
	let divString;
	let rankIter = 0;
	let fileIter = 0;
	let lightString;
	
	for(rankIter = ranks.rank8; rankIter >= ranks.rank1; rankIter--) {
		lightSquare ^= 1;
		rankName = "rank" + (rankIter+1);
		for(fileIter = files.fileA; fileIter <= files.fileH; fileIter++) {
			fileName = "file" + (fileIter+1);
			
			if(lightSquare===0) lightString="lightSquare";
			else lightString = "darkSquare";
			lightSquare^=1;
			divString = "<div class=\"square " + rankName + " " + fileName + " " + lightString + "\"/>";
			$("#board").append(divString);
 		}
 	}
}

function init() {
	console.log("init() called");
	initFilesRanksBoard();
	initHashKeys();
	initSq120To64();
	initBoardVars();
	initMvvLva();
	initBoardSquares();
}