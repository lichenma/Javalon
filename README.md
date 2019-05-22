# Javalon

An expansion of the TicTalk SpringBoot AngularJS Web Service created to help me learn about building
Web Applications. I plan on integrating a chat room and websockets into this application as well and covering 
all of the game logic of the classic board game "The Resistance: Avalon". 


## Getting Started

**Login Credentials** 

This application features authentication using spring security and there are few accounts already setup for use: 
```
Username           Password

admin              password
lma                password
player1            password
player2            password
player3            password
player4            password
player5            password
player6            password
```

**Heroku Hosting:**

Occasionally you may find my project hosted at 
```
 https://javalon.herokuapp.com/
 
 Login credientials: (see above)
```

<br>

**Local Hosting:** 

Otherwise Navigate to the `Javalon` folder, ensure gradle is installed and run the following: 
```
gradle bootrun
```

### Prerequisites

Ideally the most recent java and gradle versions, I used the following when building and testing the webpage.

```
Gradle 5.2.1  Java version 1.8.0_192
```

## Built With

* [Spring](https://spring.io/) - Application Framework used
* [Gradle](https://gradle.org/) - Dependency Management
* [AngularJS](https://angularjs.org/) - Front-end Front-end Framework
* [H2](https://www.h2database.com/html/main.html) - In-Memory Database
* [WebSockets]() - Real-time Communication Protocol


## Acknowledgments 

* Spring Documentation
