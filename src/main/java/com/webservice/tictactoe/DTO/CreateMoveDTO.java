package com.webservice.tictactoe.DTO;

import com.webservice.tictactoe.enums.MoveData;
import com.webservice.tictactoe.enums.MoveEvent;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateMoveDTO {
    @NotNull
    MoveData moveData;
    @NotNull
    MoveEvent moveEvent;
}
