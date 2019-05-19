package com.webservice.tictactoe;

import com.webservice.tictactoe.domain.Player;
import com.webservice.tictactoe.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements ApplicationRunner {

    private PlayerRepository playerRepository;

    @Autowired
    public DataLoader(PlayerRepository playerRepository){
        this.playerRepository = playerRepository;
    }
    BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public void run(ApplicationArguments args) {
        playerRepository.save(new Player("admin", "lichenma123@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("lma", "lichenma@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("jli", "lichenma12@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player1", "lichenma1@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player2", "lichenma2@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player3", "lichenma3@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player4", "lichenma4@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player5", "lichenma5@gmail.com", passwordEncoder.encode("password")));
        playerRepository.save(new Player("player6", "lichenma6@gmail.com", passwordEncoder.encode("password")));
        
        System.out.println("============= Initialized database =========");
    }
}
