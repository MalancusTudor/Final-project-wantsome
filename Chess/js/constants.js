const pieces =  { empty : 0, wP : 1, wN : 2, wB : 3,wR : 4, wQ : 5, wK : 6, 
              bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12  };
              
const boardSquareNumber = 120;

const files =  { fileA:0, fileB:1, fileC:2, fileD:3, 
	fileE:4, FILE_F:5, fileG:6, fileH:7, fileNone:8 };
	
const ranks =  { rank1:0, rank2:1, rank3:2, rank4:3, 
	rank5:4, rank6:5, rank7:6, rank8:7, rankNone:8 };
	
const colours = { white:0, black:1, both:2 };

const castleBit = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

const squares = {
  A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28,  
  A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98, 
  noSquare:99, offBoard:100
};

const maxGameMoves = 2048;
const maxPositionMoves = 256;
const maxDepth = 64;
const infinite = 30000;
const mate = 29000;
const pvEntries = 10000;

const filesBoard = new Array(boardSquareNumber);
const ranksBoard = new Array(boardSquareNumber);

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const pieceChar = ".PNBRQKpnbrqk";
const sideChar = "wb-";
const rankChar = "12345678";
const fileChar = "abcdefgh";

function fileRankToSquare(file, rank) {
 	return 21 + file  + rank * 10 ;
}

const pieceValue= [ 0, 100, 300, 300, 500, 900, 50000, 100, 300, 300, 500, 900, 50000  ];
const pieceColor = [ colours.both, colours.white, colours.white, colours.white, colours.white, colours.white, colours.white,
	colours.black, colours.black, colours.black, colours.black, colours.black, colours.black ];
	
const piecePawn = [ false, true, false, false, false, false, false, true, false, false, false, false, false ];	
const pieceKnight = [ false, false, true, false, false, false, false, false, true, false, false, false, false ];
const pieceKing = [ false, false, false, false, false, false, true, false, false, false, false, false, true ];
const pieceRookQueen = [ false, false, false, false, true, true, false, false, false, false, true, true, false ];
const pieceBishopQueen = [ false, false, false, true, false, true, false, false, false, true, false, true, false ];

const knightDirection = [ -8, -19,	-21, -12, 8, 19, 21, 12 ];
const rookDirection = [ -1, -10,	1, 10 ];
const bishopDirection = [ -9, -11, 11, 9 ];
const kingDirection = [ -1, -10,	1, 10, -9, -11, 11, 9 ];

const directionNumber = [ 0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8 ];
const pieceDirection = [ 0, 0, knightDirection, bishopDirection, rookDirection, kingDirection, kingDirection, 0, knightDirection, bishopDirection, rookDirection, kingDirection, kingDirection ];
const loopNonSlidePiece = [ pieces.wN, pieces.wK, 0, pieces.bN, pieces.bK, 0 ];
const loopNonSlideIndex = [ 0, 3 ];
const loopSlidePiece = [ pieces.wB, pieces.wR, pieces.wQ, 0, pieces.bB, pieces.bR, pieces.bQ, 0 ];
const loopSlideIndex = [ 0, 4];

const pieceKeys = new Array(14 * 120);
let sideKey;
const castleKeys = new Array(16);

const sq120ToSq64 = new Array(boardSquareNumber);
const sq64ToSq120 = new Array(64);

function rand32() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}

const mirror64 = [
56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
];

function square64(sq120) { 
	return sq120ToSq64[(sq120)];
}

function square120(sq64) {
	return sq64ToSq120[(sq64)];
}

function pieceIndex(piece, pieceNumber) {
	return (piece * 10 + pieceNumber);
}

function mirror64func(square) {
	return mirror64[square];
}

const kings = [pieces.wK, pieces.bK];
const castlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

function fromSquare(move) { return (move & 0x7F); }
function toSquare(move) { return ( (move >> 7) & 0x7F); }
function capturedSquare(move) { return ( (move >> 14) & 0xF); }
function promotedSquare(move) { return ( (move >> 20) & 0xF); }

const moveFlagEnPas = 0x40000;
const moveFlagPawnStart = 0x80000;
const moveFlagCastle = 0x1000000;
const moveFlagCapture = 0x7C000;

const noMove = 0;

function squareOffBoard(square) {
	if(filesBoard[square]===squares.offBoard) return true;
	return false;	
}

function hashPiece(piece, square) {
	gameBoard.positionKey ^= pieceKeys[(piece * 120) + square];
}

function hashCastle() { gameBoard.positionKey ^= castleKeys[gameBoard.castlePerm]; }
function hashSide() { gameBoard.positionKey ^= sideKey; }
function hashEnPas() { gameBoard.positionKey ^= pieceKeys[gameBoard.enPas]; }

const gameController = {};
gameController.engineSide = colours.both;
gameController.playerSide = colours.both;
gameController.gameOver = false;

const userMove = {};
userMove.from = squares.noSquare;
userMove.to = squares.noSquare;