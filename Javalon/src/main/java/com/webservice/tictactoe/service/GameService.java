package com.webservice.tictactoe.service;

import com.webservice.tictactoe.DTO.GameDTO;
import com.webservice.tictactoe.domain.Game;
import com.webservice.tictactoe.domain.Player;
import com.webservice.tictactoe.enums.GameStatus;
import com.webservice.tictactoe.enums.GameType;
import com.webservice.tictactoe.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Random;

@Service
@Transactional
public class GameService {

    private final GameRepository gameRepository;

    @Autowired
    public GameService(GameRepository gameRepository) {
        this.gameRepository=gameRepository;
    }

    public Game createNewGame(Player player, GameDTO gameDTO) {
        private EnumMap<Integer, Character> enumMap= new EnumMap<Integer, Character>(Character.class);
        enumMap.put(1, Character.MERLIN);
        enumMap.put(2, Character.ASSASSIN);
        enumMap.put(3, Character.PERCIVAL);
        enumMap.put(4, Character.VILLAGER);
        enumMap.put(5, Character.MORGANA);
        Game game=new Game();
        game.setFirstPlayer(player);
        game.setGameType(gameDTO.getGameType());
        game.setGameStatus(gameDTO.getGameType()== GameStatus.WAITS_FOR_PLAYER);
        game.setCreated(new Date());
        gameRepository.save(game);

        Random rand = new Random();
        int n = rand.nextInt(5); 
        n++; 
        game.setFirstPlayerCharacter(enumMap.getValue(n));
        enumMap.remove(n);
        return game;
    }

    public Game updateGameStatus(Game game, GameStatus gameStatus) {
        Game clone=getGame(game.getId());
        clone.setGameStatus(gameStatus);

        return clone;
    }

    public List<Game> getGamesToJoin(Player player) {
        return gameRepository.findByGameStatus(
                GameStatus.WAITS_FOR_PLAYER).stream().filter(game -> game.getFirstPlayer()!=player).collect(Collectors.toList());
    }

    public Game joinGame(Player player, GameDTO gameDTO) {
        Game game = getGame((long)gameDTO.getId());
        game.setSecondPlayer(player);
        gameRepository.save(game);

        updateGameStatus(game, GameStatus.IN_PROGRESS);

        return game;
    }

    public List<Game> getPlayerGames(Player player) {
        return gameRepository.findByGameStatus(
                GameStatus.IN_PROGRESS).stream().filter(game -> game.getFirstPlayer()==player).collect(Collectors.toList());
    }

    public Game getGame(Long id) {
        return gameRepository.findById(id).orElseThrow(()->new EntityNotFoundException());
    }
}
