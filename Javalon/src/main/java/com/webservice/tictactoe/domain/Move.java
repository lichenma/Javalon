package com.webservice.tictactoe.domain;

import com.webservice.tictactoe.enums.MoveData;
import com.webservice.tictactoe.enums.MoveEvent;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Move {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="id", nullable = false)
    private int id;

    @ManyToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Enumerated(EnumType.STRING)
    private MoveEvent moveEvent;

    @Enumerated(EnumType.STRING)
    private MoveData moveData;

    @ManyToOne
    @JoinColumn(name="player_id", nullable = true)
    private Player player;

    @Column(name = "created", nullable = false)
    private Date created;
}
