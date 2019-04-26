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

Below the Quest number is the number of players who are sent on this particular quest. In order for Team good to win, they need to pass three missions without team Evil assassinating Merlin - in order for team evil to win they need to assassinate Merlin or fail three missions. A mission is failed if one of the people who was selected to go on the mission fails the mission.

The vote track is for managing the mission team proposals. In order to select the players who are sent on a particular quest, we rotate through the players and they make suggestions for who goes on the missions. After a player suggests a team - the other players can vote on whether or not to accept or reject this team. Players should reject teams if they believe that the members on the team will not help their cause. Team good needs to be careful because the vote track exists to prevent too many failed suggestions in a single round. If no team is selected after five player suggestions in a row - five different players made suggestions and players rejected them - team Evil automatically wins. 




## Database 

H2 Database is used to store the data. It is an in memory data that is created when an application starts up and destroyed when the application is stopped. The advantages are: 

* Zero project setup or infrastructure 
* Zero Configuration 
* Zero Maintainance 
* Easy to use for Quick setups, POCs and Unit Tests
* Spring Boot provides simple configuration to switch between a real database and an in memory database like H2
   

We could switch over to an actual database like Mongo for NoSQL or PostgreSQL for SQL but they require a lot of setup and for a simple project like this it would save time from having to: 

* Install the Database (or setup a cloud version)
* Setup a Schema
* Setup the tables 
* Populate the data
* COnnect the application to the database by setting up a data source and a lot of other code 

Spring Boot has very good integration for H2 so we will be using it for this project. If we want to incorporate another database later that would be a good expansion but for now we will be using H2. 



## Database Model 

Here is the inital outline for the database tables used in this project. 


### Player Table

```
                        player							    

        id		            int		         PK		    
        user_name	        varchar(64)			     
        password_hash       varchar(64)			    
        email	            varchar(128)
```

I think the player table can roughly stay the same, there is no need for any other data to be stored in this table 


### Game Table 

```
                        game 

        id			            int               PK
        first_player_id	        int		          FK
        second_player_id	    int               FK
        third_player_id         int               FK
        fourth_player_id        int               FK
        fifth_player_id         int               FK
        sixth_player_id         int               FK
        created                 timestamp
        game_status             varchar(255)
        game_event		        varchar(255)
        game_data               varchar(255)
        game_type               varchar(255)

        first_player_character  varchar(255)
        second_player_character varchar(255)
        third_player_character  varchar(255)
        fourth_player_character varchar(255)
        fifth_player_character  varchar(255)
        sixth_player_character  varchar(255)
```

The game table will need major redevelopment as we need to determine which data we want to store and calculate server-side and which information we would like to calculate client side. We have the usual data like the game id, as well as the id and characters of the players in the game; but also data like when the game was created, the game status and the game type (I will be using this to manage how many players are in the game). 



I am thinking about: 

* **gameStatus** to store the usual values - WAITING FOR PLAYER, TEAM GOOD WINS, TEAM EVIL WINS 

* **gameEvent** to store information about the major game moves - PROPOSE_TEAM, VOTE_TEAM, TEAM_MISSION

* **gameData** to store information about the results of the major game moves - PASS, FAIL 

* **gameType** to store information about the game type - FIVE, SIX, SEVEN ... 



### Move Table 

```
                                    move 

                    id		            int	  	        PK
                    player_id	        int		        FK
                    game_id	            int		        FK
                    move_event	        varchar(255)	
                    move_data           varchar(255)
                    created	            timestamp
```

## Starting by Modifying the GameService 

I want to start the transition by modifying the GameService, getting the random character assignment working so that I can create a game with six random characters. 
