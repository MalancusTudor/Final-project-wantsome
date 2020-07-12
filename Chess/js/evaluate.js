const pawnTable = [
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];


const knightTable = [
0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
];

const bishopTable = [
0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];

const rookTable = [
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0		
];

const bishopPair = 40;


function evalPosition() {
	
	let score = gameBoard.material[colours.white] - gameBoard.material[colours.black];
	
	let piece;
	let sq;
	let pieceNumber;
	
	piece = pieces.wP;
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score += pawnTable[square64(sq)];
	}
	
	piece = pieces.bP;
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score -= pawnTable[mirror64func(square64(sq))];
	}
	
	piece = pieces.wN;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score += knightTable[square64(sq)];
	}	

	piece = pieces.bN;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score -= knightTable[mirror64func(square64(sq))];
	}			
	
	piece = pieces.wB;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score += bishopTable[square64(sq)];
	}	

	piece = pieces.bB;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score -= bishopTable[mirror64func(square64(sq))];
	}
	
	piece = pieces.wR;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score += rookTable[square64(sq)];
	}	

	piece = pieces.bR;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score -= rookTable[mirror64func(square64(sq))];
	}
	
	piece = pieces.wQ;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score += rookTable[square64(sq)];
	}	

	piece = pieces.bQ;	
	for(pieceNumber = 0; pieceNumber < gameBoard.pieceNumber[piece]; ++pieceNumber) {
		sq = gameBoard.pieceList[pieceIndex(piece,pieceNumber)];
		score -= rookTable[mirror64func(square64(sq))];
	}	
	
	if(gameBoard.pieceNumber[pieces.wB] >= 2) {
		score += bishopPair;
	}
	
	if(gameBoard.pieceNumber[pieces.bB] >= 2) {
		score -= bishopPair;
	}
	
	if(gameBoard.side === colours.white) {
		return score;
	} else {
		return -score;
	}
}