package com.webservice.tictactoe.service;

import com.webservice.tictactoe.DTO.GameDTO;
import com.webservice.tictactoe.domain.Game;
import com.webservice.tictactoe.domain.Player;
import com.webservice.tictactoe.enums.GameStatus;
import com.webservice.tictactoe.enums.GameType;
import com.webservice.tictactoe.enums.Character;
import com.webservice.tictactoe.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.Date;
import java.util.EnumMap;
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

        Game game=new Game();
        game.setFirstPlayer(player);
        game.setGameType(gameDTO.getGameType());
        game.setGameStatus(GameStatus.WAITS_FOR_PLAYER);
        game.setCreated(new Date());

        /////////////////////////////////////
        // Randomly Selecting Character Role
        /////////////////////////////////////

        Random rand = new Random();
        int n = rand.nextInt(5); 
        n++;

        if (n==1){
            game.setFirstPlayerCharacter(Character.MERLIN);
        } else if (n==2) {
            game.setFirstPlayerCharacter(Character.ASSASSIN);
        } else if (n==3) {
            game.setFirstPlayerCharacter(Character.PERCIVAL);
        } else if (n==4) {
            game.setFirstPlayerCharacter(Character.VILLAGER);
        } else if (n==5) {
            game.setFirstPlayerCharacter(Character.MORGANA);
        }

        gameRepository.save(game);

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
        EnumMap<Character, Integer> enumMap= new EnumMap<Character, Integer>(Character.class);
        enumMap.put(Character.MERLIN, 1);
        enumMap.put(Character.ASSASSIN, 2);
        enumMap.put(Character.PERCIVAL, 3);
        enumMap.put(Character.VILLAGER, 4);
        enumMap.put(Character.MORGANA, 5);

        if (game.getSecondPlayer()==null){
            game.setSecondPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());

            Random rand = new Random();
            int n = rand.nextInt(5);
            n++;

            while (!enumMap.containsValue(n)){
                n = (n+1)%5;
            }

            for (Character character : enumMap.keySet()){
                if (enumMap.get(character)==n){
                    game.setSecondPlayerCharacter(character);
                }
            }
            gameRepository.save(game);
        } else if (game.getThirdPlayer()==null)

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
