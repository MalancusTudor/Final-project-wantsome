$("#setFen").click(function () {
	let fenStr = $("#fenInput").val();	
	newGame(fenStr);
});

$('#takeButton').click( function () {
	if(gameBoard.hisPly > 0) {
		takeMove();
		$("#gameStatus").text("");
		gameBoard.ply = 0;
		setInitialBoardPieces();
		gameController.gameOver = false;
	}
});

$('#newGameButton').click( function () {
	newGame(startFEN);
});

function newGame(fenStr) {
	parseFen(fenStr);
	printBoard();
	setInitialBoardPieces();
	checkAndSet();
}

function clearAllPieces() {
	$(".piece").remove();
}

function setInitialBoardPieces() {

	let sq;
	let sq120;
	let pce;
	
	clearAllPieces();
	
	for(sq = 0; sq < 64; ++sq) {
		sq120 = square120(sq);
		pce = gameBoard.pieces[sq120];
		if(pce >= pieces.wP && pce <= pieces.bK) {
			addGUIPiece(sq120, pce);
		}
	}
}

function deselectSquare(sq) {
	$('.square').each( function(index) {
		if(pieceIsOnSquare(sq, $(this).position().top, $(this).position().left) === true) {
				$(this).removeClass('squareSelected');
		}
	} );
}

function setSquareSelected(sq) {
	$('.square').each( function(index) {
		if(pieceIsOnSquare(sq, $(this).position().top, $(this).position().left) === true) {
				$(this).addClass('squareSelected');
		}
	} );
}

function clickedSquare(pageX, pageY) {
	console.log('clickedSquare() at ' + pageX + ',' + pageY);
	let position = $('#board').position();
	
	let workedX = Math.floor(position.left);
	let workedY = Math.floor(position.top);
	
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);
	
	let file = Math.floor((pageX-workedX) / 90);
	let rank = 7 - Math.floor((pageY-workedY) / 90);
	
	let sq = fileRankToSquare(file,rank);
	
	console.log('Clicked sq:' + printSquare(sq));
	
	setSquareSelected(sq);	
	
	return sq;
}

$(document).on('click','.piece', function (e) {
	console.log('piece Click');
	
	if(userMove.from === squares.noSquare) {
		userMove.from = clickedSquare(e.pageX, e.pageY);
	} else {
		userMove.to = clickedSquare(e.pageX, e.pageY);
	}
	
	makeUserMove();
	
});

$(document).on('click','.square', function (e) {
	console.log('square Click');	
	if(userMove.from !== squares.noSquare) {
		userMove.to = clickedSquare(e.pageX, e.pageY);
		makeUserMove();
	}

});

function makeUserMove() {

	if(userMove.from !== squares.noSquare && userMove.to !== squares.noSquare) {
	
		console.log("User Move:" + printSquare(userMove.from) + printSquare(userMove.to));	
		
		let parsed = parseMove(userMove.from,userMove.to);
		
		if(parsed !== noMove) {
			makeMove(parsed);
			printBoard();
			moveGUIPiece(parsed);
			checkAndSet();
			preSearch();
		}
	
		deselectSquare(userMove.from);
		deselectSquare(userMove.to);
		
		userMove.from = squares.noSquare;
		userMove.to = squares.noSquare;
	}

}

function pieceIsOnSquare(sq, top, left) {

	if( (ranksBoard[sq] === 7 - Math.round(top/90) ) && 
		filesBoard[sq] === Math.round(left/90) ) {
		return true;
	}
		
	return false;

}

function removeGUIPiece(sq) {

	$('.piece').each( function(index) {
		if(pieceIsOnSquare(sq, $(this).position().top, $(this).position().left) === true) {
			$(this).remove();
		}
	} );
	
}

function addGUIPiece(sq, pce) {

	let file = filesBoard[sq];
	let rank = ranksBoard[sq];
	let rankName = "rank" + (rank+1);
	let	fileName = "file" + (file+1);
	let pieceFileName = "images/" + sideChar[pieceColor[pce]] + pieceChar[pce].toUpperCase() + ".png";
	let	imageString = "<image src=\"" + pieceFileName + "\" class=\"piece " + rankName + " " + fileName + "\"/>";
	$("#board").append(imageString);
}

function moveGUIPiece(move) {
	
	let from = fromSquare(move);
	let to = toSquare(move);	
	
	if(move & moveFlagEnPas) {
		let epRemove;
		if(gameBoard.side === colours.black) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		removeGUIPiece(epRemove);
	} else if(capturedSquare(move)) {
		removeGUIPiece(to);
	}
	
	let file = filesBoard[to];
	let rank = ranksBoard[to];
	let rankName = "rank" + (rank+1);
	let	fileName = "file" + (file+1);
	
	$('.piece').each( function(index) {
		if(pieceIsOnSquare(from, $(this).position().top, $(this).position().left) === true) {
			$(this).removeClass();
			$(this).addClass("piece " + rankName + " " + fileName);
		}
	} );
	
	if(move & moveFlagCastle) {
		switch(to) {
			case squares.G1: removeGUIPiece(squares.H1); addGUIPiece(squares.F1, pieces.wR); break;
			case squares.C1: removeGUIPiece(squares.A1); addGUIPiece(squares.D1, pieces.wR); break;
			case squares.G8: removeGUIPiece(squares.H8); addGUIPiece(squares.F8, pieces.bR); break;
			case squares.C8: removeGUIPiece(squares.A8); addGUIPiece(squares.D8, pieces.bR); break;
		}
	} else if (promotedSquare(move)) {
		removeGUIPiece(to);
		addGUIPiece(to, promotedSquare(move));
	}
	
}

function drawMaterial() {

	if (gameBoard.pieceNumber[pieces.wP]!==0 || gameBoard.pieceNumber[pieces.bP]!==0) return false;
	if (gameBoard.pieceNumber[pieces.wQ]!==0 || gameBoard.pieceNumber[pieces.bQ]!==0 ||
					gameBoard.pieceNumber[pieces.wR]!==0 || gameBoard.pieceNumber[pieces.bR]!==0) return false;
	if (gameBoard.pieceNumber[pieces.wB] > 1 || gameBoard.pieceNumber[pieces.bB] > 1) {return false;}
    if (gameBoard.pieceNumber[pieces.wN] > 1 || gameBoard.pieceNumber[pieces.bN] > 1) {return false;}
	
	if (gameBoard.pieceNumber[pieces.wN]!==0 && gameBoard.pieceNumber[pieces.wB]!==0) {return false;}
	if (gameBoard.pieceNumber[pieces.bN]!==0 && gameBoard.pieceNumber[pieces.bB]!==0) {return false;}
	 
	return true;
}

function threeFoldRep() {
	let i = 0, r = 0;
	
	for(i = 0; i < gameBoard.hisPly; ++i) {
		if (gameBoard.history[i].positionKey === gameBoard.positionKey) {
		    r++;
		}
	}
	return r;
}

function checkResult() {
	if(gameBoard.fiftyMove >= 100) {
		 $("#gameStatus").text("GAME DRAWN {fifty move rule}"); 
		 return true;
	}
	
	if (threeFoldRep() >= 2) {
     	$("#gameStatus").text("GAME DRAWN {3-fold repetition}"); 
     	return true;
    }
	
	if (drawMaterial() === true) {
     	$("#gameStatus").text("GAME DRAWN {insufficient material to mate}"); 
     	return true;
    }
    
    generateMoves();
      
    let MoveNum = 0;
	let found = 0;
	
	for(MoveNum = gameBoard.moveListStart[gameBoard.ply]; MoveNum < gameBoard.moveListStart[gameBoard.ply + 1]; ++MoveNum)  {	
       
        if ( makeMove(gameBoard.moveList[MoveNum]) === false)  {
            continue;
        }
        found++;
		takeMove();
		break;
    }
	
	if(found !== 0) return false;
	
	let InCheck = squareAttacked(gameBoard.pieceList[pieceIndex(kings[gameBoard.side],0)], gameBoard.side^1);
	
	if(InCheck === true) {
		if(gameBoard.side === colours.white) {
	      $("#gameStatus").text("GAME OVER: Black Wins");
	      return true;
        } else {
	      $("#gameStatus").text("GAME OVER: White wins");
	      return true;
        }
	} else {
		$("#gameStatus").text("GAME DRAWN: Stalemate");return true;
	}	
}

function checkAndSet() {
	if(checkResult() === true) {
		gameController.gameOver = true;
	} else {
		gameController.gameOver = false;
		$("#gameStatus").text('');
	}
}

function preSearch() {
	if(gameController.gameOver === false) {
		searchController.thinking = true;
		setTimeout( function() { startSearch(); }, 200 );
	}
}

$('#searchButton').click( function () {	
	gameController.playerSide = gameController.side ^ 1;
	preSearch();
});

function startSearch() {

	searchController.depth = maxDepth;
	let t = $.now();
	let tt = $('#thinkTime').val();
	
	searchController.time = parseInt(tt) * 1000;
	searchPosition();
	
	makeMove(searchController.best);
	moveGUIPiece(searchController.best);
	checkAndSet();
}