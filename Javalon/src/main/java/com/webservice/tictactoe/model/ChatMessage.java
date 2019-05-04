package com.webservice.tictactoe.model;

public class ChatMessage {

    private MessageType type;
    private String content;
    private String sender;
    private String[] players;

    public enum MessageType {

        CHAT,
        JOIN,
        LEAVE,
        MOVE,
        PROPOSE_TEAM,
        VOTE_TEAM,
        GAME_INFO
    }

    public MessageType getType() {

        return type;
    }

    public void setType(MessageType type) {

        this.type = type;
    }

    public String[] getPlayers(){
        return players;
    }

    public void setPlayers(String[] players) {
        this.players = players;
    }

    public String getContent() {

        return content;
    }

    public void setContent(String content) {

        this.content = content;
    }

    public String getSender() {

        return sender;
    }

    public void setSender(String sender) {

        this.sender = sender;
    }
}
