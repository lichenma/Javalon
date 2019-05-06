package com.webservice.tictactoe.controller;

import com.webservice.tictactoe.model.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import javax.websocket.server.PathParam;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.sendGameInfo/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage sendGameInfo(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.sendMove/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage sendMove(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.proposeTeam/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage proposeTeam(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.voteTeam/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage voteTeam(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.voteMission/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage voteMission(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser/{Id}")
    @SendTo("/topic/{Id}")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor headerAccessor, @DestinationVariable Long Id) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("id", Id);
        return chatMessage;
    }
}
