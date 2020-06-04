import React from 'react';

import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallen-soldiers_block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import King from '../pieces/king';
import Pawn from '../pieces/pawn';
import Queen from '../pieces/queen';
import Bishop from '../pieces/bishop';
import Rook from '../pieces/rook';
import Knight from '../pieces/knight';

function Popup(props) {
  
}

export default class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      turn: 'white'
    }
  }
 
  handleClick(i){
    const squares = this.state.squares.slice();
    if(this.state.sourceSelection === -1) {
      if(!squares[i] || squares[i].player !== this.state.player) {
        this.setState({status: "Wrong selection. Choose player " + this.state.player + " pieces."});
        if (squares[i]) {
          squares[i].style = {...squares[i].style, backgroundColor: ""};
        }
      } else {
        squares[i].style = {...squares[i].style, backgroundColor: "RGB(111,143,114)"}; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose destination for the selected piece",
          sourceSelection: i
        });
      }
    } else if(this.state.sourceSelection > -1) {
      squares[this.state.sourceSelection].style = {...squares[this.state.sourceSelection].style, backgroundColor: ""};
      if(squares[i] && squares[i].player === this.state.player) {
        this.setState({
          status: "Wrong selection. Choose valid source and destination again.",
          sourceSelection: -1,
        });
      } else {
        const squares = this.state.squares.slice();
        const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
        const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
        const isDestEnemyOccupied = squares[i]? true : false; 
        const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
        const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
        const isMoveLegal = this.isMoveLegal(srcToDestPath);
        if(isMovePossible && isMoveLegal) {
          if(squares[i] === null) {
            if(squares[this.state.sourceSelection].player === 1) {
              if(squares[this.state.sourceSelection].constructor === Pawn && i < 8) {
                squares[this.state.sourceSelection] = new Queen(1);
                let player = this.state.player === 1? 2: 1;
                let turn = this.state.turn === 'white'? 'black' : 'white';
                this.setState({
                  sourceSelection: -1,
                  squares: squares,
                  whiteFallenSoldiers: whiteFallenSoldiers,
                  blackFallenSoldiers: blackFallenSoldiers,
                  player: player,
                  status: '',
                  turn: turn
                });
              }
            } else {
              if(squares[this.state.sourceSelection].constructor === Pawn && i > 55) {
                console.log(this.state.sourceSelection);
                console.log(i);
                squares[this.state.sourceSelection] = new Queen(2);
                let player = this.state.player === 1? 2: 1;
                let turn = this.state.turn === 'white'? 'black' : 'white';
                this.setState({
                  sourceSelection: -1,
                  squares: squares,
                  whiteFallenSoldiers: whiteFallenSoldiers,
                  blackFallenSoldiers: blackFallenSoldiers,
                  player: player,
                  status: '',
                  turn: turn
                });
              }
            }
            
            squares[i] = squares[this.state.sourceSelection];
            squares[this.state.sourceSelection] = null;
            let player = this.state.player === 1? 2: 1;
            let turn = this.state.turn === 'white'? 'black' : 'white';
            this.setState({
              sourceSelection: -1,
              squares: squares,
              whiteFallenSoldiers: whiteFallenSoldiers,
              blackFallenSoldiers: blackFallenSoldiers,
              player: player,
              status: '',
              turn: turn
            });
          } else {
            if(squares[i].constructor !== King) {
              if(squares[i].player === 1) {
                whiteFallenSoldiers.push(squares[i]);
              } else {
                blackFallenSoldiers.push(squares[i]);
              }
              if(squares[this.state.sourceSelection].player === 1) {
                if(squares[this.state.sourceSelection].constructor === Pawn && i < 8) {
                  squares[this.state.sourceSelection] = new Queen(1);
                  let player = this.state.player === 1? 2: 1;
                  let turn = this.state.turn === 'white'? 'black' : 'white';
                  this.setState({
                    sourceSelection: -1,
                    squares: squares,
                    whiteFallenSoldiers: whiteFallenSoldiers,
                    blackFallenSoldiers: blackFallenSoldiers,
                    player: player,
                    status: '',
                    turn: turn
                  });
                }
              } else {
                if(squares[this.state.sourceSelection].constructor === Pawn && i > 55) {
                  squares[this.state.sourceSelection] = new Queen(2);
                  let player = this.state.player === 1? 2: 1;
                  let turn = this.state.turn === 'white'? 'black' : 'white';
                  this.setState({
                    sourceSelection: -1,
                    squares: squares,
                    whiteFallenSoldiers: whiteFallenSoldiers,
                    blackFallenSoldiers: blackFallenSoldiers,
                    player: player,
                    status: '',
                    turn: turn
                  });
                }
              }
              squares[i] = squares[this.state.sourceSelection];
              squares[this.state.sourceSelection] = null;
              let player = this.state.player === 1? 2: 1;
              let turn = this.state.turn === 'white'? 'black' : 'white';
              this.setState({
                sourceSelection: -1,
                squares: squares,
                whiteFallenSoldiers: whiteFallenSoldiers,
                blackFallenSoldiers: blackFallenSoldiers,
                player: player,
                status: '',
                turn: turn
              });
            } else {
              this.setState({
                status: "Wrong selection. Choose valid source and destination again.",
                sourceSelection: -1,
              });
            } 
          }
          // Check validation
          for(let index = 0; index < squares.length; ++index) {
            if(this.state.player === 1) {
              if(squares[index] !== null && squares[index].constructor === King && squares[index].player === 2) {
                for(let possAttkPos = 0; possAttkPos < squares.length; ++ possAttkPos){
                  if(Math.abs(index - possAttkPos) % 9 === 0 || Math.abs(index - possAttkPos) % 7 === 0) {
                    if(squares[possAttkPos] !== null && squares[possAttkPos].player === 1 && (squares[possAttkPos].constructor === Bishop || squares[possAttkPos].constructor === Queen)) {
                      const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                      const isMoveLegal = this.isMoveLegal(pieceBetween);
                      if(isMoveLegal){
                        this.setState({
                          status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                        });
                      }
                    }
                  }
                  let mod = index % 8;
                  let diff = 8 - mod;
                  if(Math.abs(index - possAttkPos) % 8 === 0 || (possAttkPos >= (index - mod) && possAttkPos < (index + diff))) {
                    if(squares[possAttkPos] !== null && squares[possAttkPos].player === 1 && (squares[possAttkPos].constructor === Rook || squares[possAttkPos].constructor === Queen)) {
                      const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                      const isMoveLegal = this.isMoveLegal(pieceBetween);
                      if(isMoveLegal){
                        this.setState({
                          status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                        });
                      }
                    }
                  }

                  if(index - 17 === possAttkPos || 
                    index - 10 === possAttkPos || 
                    index + 6 === possAttkPos || 
                    index + 15 === possAttkPos || 
                    index - 15 === possAttkPos || 
                    index - 6 === possAttkPos || 
                    index + 10 === possAttkPos || 
                    index + 17 === possAttkPos) {
                      if(squares[possAttkPos] !== null && squares[possAttkPos].player === 1 && squares[possAttkPos].constructor === Knight) {
                        const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                        const isMoveLegal = this.isMoveLegal(pieceBetween);
                        if(isMoveLegal){
                          this.setState({
                            status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                          });
                        }
                      }
                    }

                  if((index < possAttkPos) && (Math.abs(index - possAttkPos)  === 9 || Math.abs(index - possAttkPos) === 7)) {
                    if(squares[possAttkPos] !== null && squares[possAttkPos].player === 1 && squares[possAttkPos].constructor === Pawn) {
                      const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                      const isMoveLegal = this.isMoveLegal(pieceBetween);
                      if(isMoveLegal){
                        this.setState({
                          status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                        });
                      }
                    }
                  }
                  
                }
              }
            } else {
              if(squares[index] !== null && squares[index].constructor === King && squares[index].player === 1) {
                for(let possAttkPos = 0; possAttkPos < squares.length; ++ possAttkPos){
                  if(Math.abs(index - possAttkPos) % 9 === 0 || Math.abs(index - possAttkPos) % 7 === 0) {
                    if(squares[possAttkPos] !== null && squares[possAttkPos].player === 2 && (squares[possAttkPos].constructor === Bishop || squares[possAttkPos].constructor === Queen)) {
                      const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                      const isMoveLegal = this.isMoveLegal(pieceBetween);
                      if(isMoveLegal){
                        this.setState({
                          status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                        });
                      }
                    }
                  }
                  let mod = index % 8;
                  let diff = 8 - mod;
                  if(Math.abs(index - possAttkPos) % 8 === 0 || (possAttkPos >= (index - mod) && possAttkPos < (index + diff))) {
                    if(squares[possAttkPos] !== null && squares[possAttkPos].player === 2 && (squares[possAttkPos].constructor === Rook || squares[possAttkPos].constructor === Queen)) {
                      const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                      const isMoveLegal = this.isMoveLegal(pieceBetween);
                      if(isMoveLegal){
                        this.setState({
                          status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                        });
                      }
                    }
                  }

                  if(index - 17 === possAttkPos || 
                    index - 10 === possAttkPos || 
                    index + 6 === possAttkPos || 
                    index + 15 === possAttkPos || 
                    index - 15 === possAttkPos || 
                    index - 6 === possAttkPos || 
                    index + 10 === possAttkPos || 
                    index + 17 === possAttkPos) {
                      if(squares[possAttkPos] !== null && squares[possAttkPos].player === 2 && squares[possAttkPos].constructor === Knight) {
                        const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                        const isMoveLegal = this.isMoveLegal(pieceBetween);
                        if(isMoveLegal){
                          this.setState({
                            status: "Check by " + squares[possAttkPos] + " from position " + possAttkPos
                          });
                        }
                      }
                    }
                  
                    if((index < possAttkPos) && (Math.abs(index - possAttkPos)  === 9 || Math.abs(index - possAttkPos) === 7)) {
                      if(squares[possAttkPos] !== null && squares[possAttkPos].player === 2 && squares[possAttkPos].constructor === Pawn) {
                        const pieceBetween = squares[possAttkPos].getSrcToDestPath(possAttkPos, index);
                        const isMoveLegal = this.isMoveLegal(pieceBetween);
                        if(isMoveLegal){
                          this.setState({
                            status: "Check by " + squares[possAttkPos]+ " from position " + possAttkPos
                          });
                        }
                      }
                    }

                }
              }
            }
          }
        } else {
          this.setState({
            status: "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1,
          });
        }
      }
    }

  }

  /**
   * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
   * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
   * @return {Boolean}               
   */
  isMoveLegal(srcToDestPath){
    let isLegal = true;
    for(let i = 0; i < srcToDestPath.length; i++) {
      if(this.state.squares[srcToDestPath[i]] !== null) {
        isLegal = false;
      }
    }
    return isLegal;
  }

  render() {

    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board 
            squares = {this.state.squares}
            onClick = {(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h3>Turn</h3>
            <div id="player-turn-box" style={{backgroundColor: this.state.turn}}>
              
            </div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">
              
              {<FallenSoldierBlock
              whiteFallenSoldiers = {this.state.whiteFallenSoldiers}
              blackFallenSoldiers = {this.state.blackFallenSoldiers}
              />
            }
            </div>
          </div>
        </div>
      </div>
      );
  }
}