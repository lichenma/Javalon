## Discussion 

Let's pick up where we left off in the TicTacToe project. We have successfully created a webservice
in Spring Boot and AngularJS which handles user authentication, the handling of the game logic and 
the creation of game rooms. We also successfully integrated a chat room and passed game logic through websockets - allowing the application to run "realtime". 

First comes the design of the project, how do we want to implement the game logic from the classic board game. Here is some of the game logic: 

## The Characters 

The game supports many characters depending on the number of players but for now, I will design this game for my small group of dorm friends - around six players at a time. We can expand on this in the future to encompass more characters and the various game logic accompanying them but for now let's stick to the basic small game. 


The five to six characters we are dealing with are as follows: 

* Merlin 
* Morgana
* Assassin 
* Percival 
* Villager x2

Each character has their own special trait and information that they are aware of: 

### Merlin - Team Good 
```
Special Ability: Can see Assassin and Morgana

Note: If assassin chooses assassinate Merlin at any time, team evil wins 
```

### Percival - Team Good 
```
Special Ability: Can see Merlin and Morgana but does not know which is which 

Note: Tries to determine who Merlin is and protects that individual 
```

### Villager - Team Good
```
Special Ability: Ignorance is Bliss - Literally knows nothing 
```

### Morgana - Team Evil 
```
Special Ability: Can see other team evil members (Assassin)

Note: Wants to act like Merlin to fool percival 
```

### Assassin - Team Evil 
```
Special Ability: Can see other team evil members (Morgana) AND assassinate a character 
                 If the assassin correctly chooses to assassinate Merlin, team evil 
                 wins but loses otherwise 
```


## The Board 

For six players the game board is structured as follows: 


```
Quest 1   Quest 2   Quest 3   Quest 4  Quest 5 
   2         3         4         3        4

VOTE TRACK 

   1         2         3         4        5 
```



