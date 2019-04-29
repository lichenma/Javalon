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

        EnumMap<Character, Integer> enumMap = new EnumMap<Character, Integer>(Character.class);
        enumMap = initializeEnum(enumMap);
        game.setFirstPlayerCharacter(getNewCharacter(enumMap));

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
        //TODO incorportate game type into the create game logic

        Game game = getGame((long)gameDTO.getId());
        EnumMap<Character, Integer> enumMap= new EnumMap<Character, Integer>(Character.class);
        enumMap=initializeEnum(enumMap);

        if (game.getSecondPlayer()==null){
            game.setSecondPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());
            game.setSecondPlayerCharacter(getNewCharacter(enumMap));

            //TODO ADDED THIS FOR TESTING PURPOSES PLEASE REMOVE THIS FOR PRODUCTION
            updateGameStatus(game, GameStatus.IN_PROGRESS);
            gameRepository.save(game);
        } else if (game.getThirdPlayer()==null) {
            game.setThirdPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());
            enumMap.remove(game.getSecondPlayerCharacter());
            game.setThirdPlayerCharacter(getNewCharacter(enumMap));
            gameRepository.save(game);
        } else if (game.getFourthPlayer()==null) {
            game.setFourthPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());
            enumMap.remove(game.getSecondPlayerCharacter());
            enumMap.remove(game.getThirdPlayerCharacter());
            game.setFourthPlayerCharacter(getNewCharacter(enumMap));
            gameRepository.save(game);
        } else if (game.getFifthPlayer()==null) {
            game.setFifthPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());
            enumMap.remove(game.getSecondPlayerCharacter());
            enumMap.remove(game.getThirdPlayerCharacter());
            enumMap.remove(game.getFourthPlayerCharacter());
            game.setFifthPlayerCharacter(getNewCharacter(enumMap));
            gameRepository.save(game);
        } else if (game.getSixthPlayer()==null) {
            game.setSixthPlayer(player);
            enumMap.remove(game.getFirstPlayerCharacter());
            enumMap.remove(game.getSecondPlayerCharacter());
            enumMap.remove(game.getThirdPlayerCharacter());
            enumMap.remove(game.getFourthPlayerCharacter());
            enumMap.remove(game.getFifthPlayerCharacter());
            game.setSixthPlayerCharacter(getNewCharacter(enumMap));
            updateGameStatus(game, GameStatus.IN_PROGRESS);
            gameRepository.save(game);
        } else {
            // something went wrong
        }
        return game;
    }

    public List<Game> getPlayerGames(Player player) {
        return gameRepository.findByGameStatus(
                GameStatus.IN_PROGRESS).stream().filter(game -> game.getFirstPlayer()==player).collect(Collectors.toList());
    }

    public Game getGame(Long id) {
        return gameRepository.findById(id).orElseThrow(()->new EntityNotFoundException());
    }

    public Character getCharacter(Player player, Long id){
        Game game = getGame(id);
        if (game.getFirstPlayer()==player){
            return game.getFirstPlayerCharacter();
        } else if (game.getSecondPlayer()==player){
            return game.getSecondPlayerCharacter();
        } else if (game.getThirdPlayer()==player){
            return game.getThirdPlayerCharacter();
        } else if (game.getFourthPlayer()==player){
            return game.getFourthPlayerCharacter();
        } else if (game.getFifthPlayer()==player){
            return game.getFifthPlayerCharacter();
        } else if (game.getSixthPlayer()==player){
            return game.getSixthPlayerCharacter();
        } else {
            return null;
        }
    }

    private Character getNewCharacter (EnumMap<Character,Integer> enumMap){
        Random rand = new Random();
        int n = rand.nextInt(6);
        n++;

        while (!enumMap.containsValue(n)){
            n +=1;
            if (n==7){
                n=1;
            }
        }

        for (Character character : enumMap.keySet()){
            if (enumMap.get(character)==n){
                return character;
            }
        }
        return null;
    }

    private EnumMap<Character,Integer> initializeEnum (EnumMap<Character, Integer> enumMap){
        enumMap.put(Character.MERLIN, 1);
        enumMap.put(Character.ASSASSIN, 2);
        enumMap.put(Character.PERCIVAL, 3);
        enumMap.put(Character.VILLAGER_1, 4);
        enumMap.put(Character.MORGANA, 5);
        enumMap.put(Character.VILLAGER, 6);
        return enumMap;
    }
}
