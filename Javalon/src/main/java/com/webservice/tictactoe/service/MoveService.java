package com.webservice.tictactoe.service;

import com.webservice.tictactoe.DTO.CreateMoveDTO;
import com.webservice.tictactoe.DTO.MoveDTO;
import com.webservice.tictactoe.domain.Game;
import com.webservice.tictactoe.domain.Move;
import com.webservice.tictactoe.domain.Player;
import com.webservice.tictactoe.domain.Position;
import com.webservice.tictactoe.enums.GameStatus;
import com.webservice.tictactoe.enums.GameType;
import com.webservice.tictactoe.enums.Piece;
import com.webservice.tictactoe.enums.Character;
import com.webservice.tictactoe.repository.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MoveService {

    private final MoveRepository moveRepository;

    @Autowired
    public MoveService(MoveRepository moveRepository) {
        this.moveRepository=moveRepository;
    }

    public Move createMove(Game game, Player player, CreateMoveDTO createMoveDTO) {

        Move move = new Move();
        move.setMoveEvent(createMoveDTO.getMoveEvent());
        move.setMoveData(createMoveDTO.getMoveData());
        move.setCreated(new Date());
        move.setPlayer(player);
        move.setGame(game);

        moveRepository.save(move);

        return move;
    }

    public Move autoCreateMove(Game game) {
        //TODO Don't know if I even want to implement an anutoCreate Move Since it is probably gonna be tragic - Might try in future

        Move move= new Move();
        //move.setBoardColumn(GameLogic.nextAutoMove(getTakenMovePositionsInGame(game)).getBoardColumn());
        //move.setBoardRow(GameLogic.nextAutoMove(getTakenMovePositionsInGame(game)).getBoardRow());
        move.setCreated(new Date());
        move.setPlayer(null);
        move.setGame(game);

        moveRepository.save(move);

        return move;
    }

//    public GameStatus checkCurrentGameStatus(Game game) {
//
//        if (GameLogic.isWinner(getPlayerMovePositionsInGame(game, game.getFirstPlayer()))) {
//            return GameStatus.FIRST_PLAYER_WON;
//        } else if (GameLogic.isWinner(getPlayerMovePositionsInGame(game, game.getSecondPlayer()))){
//            return GameStatus.SECOND_PLAYER_WON;
//        } else if (GameLogic.boardIsFull(getTakenMovePositionsInGame(game))) {
//            return GameStatus.TIE;
//        } else if (game.getGameType() == GameType.SIX && game.getSecondPlayer() == null) {
//            return GameStatus.WAITS_FOR_PLAYER;
//        } else {
//            return GameStatus.IN_PROGRESS;
//        }
//    }

    public List<MoveDTO> getMovesInGame(Game game) {

        List<Move> movesInGame = moveRepository.findByGame(game);
        List<MoveDTO> moves = new ArrayList<>();
        Character currentCharacter = game.getFirstPlayerCharacter();

        for (Move move: movesInGame) {

            MoveDTO moveDTO = new MoveDTO();
            moveDTO.setMoveData(move.getMoveData());
            moveDTO.setMoveEvent(move.getMoveEvent());
            moveDTO.setCreated(move.getCreated());
            moveDTO.setGameStatus(move.getGame().getGameStatus());
            moveDTO.setUserName(move.getPlayer().getUserName());
            moveDTO.setPlayerCharacterCode(currentCharacter);
            moves.add(moveDTO);

            currentCharacter = game.getSecondPlayerCharacter();
        }

        return moves;
    }

//    public List<Position> getTakenMovePositionsInGame(Game game) {
//
////        return moveRepository.findByGame(game).stream()
////                .map(move -> new Position(move.getBoardRow(), move.getBoardColumn()))
////                .collect(Collectors.toList());
//    }

//    public List<Position> getPlayerMovePositionsInGame(Game game, Player player) {
//
////        return moveRepository.findByGameAndPlayer(game, player).stream()
////                .map(move -> new Position(move.getBoardRow(), move.getBoardColumn()))
////                .collect(Collectors.toList());
//    }

    public int getNumberOfPlayerMovesInGame(Game game, Player player) {

        return moveRepository.countByGameAndPlayer(game, player);
    }

    public boolean isPlayerTurn(Game game, Player firstPlayer, Player secondPlayer, Player currentPlayer) {

        if (currentPlayer.equals(firstPlayer)){
            return GameLogic.playerTurn(getNumberOfPlayerMovesInGame(game, firstPlayer),
                    getNumberOfPlayerMovesInGame(game, secondPlayer));
        }
        return !GameLogic.playerTurn(getNumberOfPlayerMovesInGame(game, firstPlayer),
                getNumberOfPlayerMovesInGame(game, secondPlayer));
    }
}
