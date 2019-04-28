package com.webservice.tictactoe.DTO;

import com.webservice.tictactoe.enums.GameStatus;
import com.webservice.tictactoe.enums.MoveData;
import com.webservice.tictactoe.enums.MoveEvent;
import com.webservice.tictactoe.enums.Piece;
import com.webservice.tictactoe.enums.Character;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MoveDTO {

    private MoveEvent moveEvent;
    private MoveData moveData;
    private Date created;
    private String userName;
    private GameStatus gameStatus;
    private Character playerCharacterCode;
    private Piece playerPieceCode;
}
