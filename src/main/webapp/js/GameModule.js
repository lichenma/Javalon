var gameModule=angular.module('gameModule',[]);

gameModule.controller('newGameController', ['$rootScope','$scope', '$http', '$location',
    function (rootScope, scope, http, location) {

        rootScope.gameId = null;
        scope.newGameData = null;
        rootScope.playerId = null;
        scope.playerId = null;

        scope.newGameOptions = {
            // availablePieces: [
            //     {name: 'X'},
            //     {name: 'O'}
            // ],
            selectedPiece: {name: 'O'},
            availableGameTypes: [
                {name: 'TWO'},
                {name: 'SIX'}
            ],
            selectedBoardDimension: {name: 'COMPUTER'}
        };

        scope.createNewGame = function () {

            var data = scope.newGameData;
            var params = JSON.stringify(data);

            http.post("/game/create", params, {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).then(function (response) {
                rootScope.gameId = response.data.id;
                location.path('/game/' + rootScope.gameId);
            }).catch(function (response) {
                location.path('/player/panel');
            });

            // retrieving player id data

            http.get('/player/logged').then(function (response) {
                var temp = response.data
                rootScope.playerId=temp.object.userName;
                console.log(rootScope.playerId);
            }).catch(function (response) {
                rootScope.playerId="error";
            });
        }

    }]);

gameModule.controller('gamesToJoinController', ['$rootScope','$scope', '$http', '$location',
    function (rootScope, scope, http, location) {

        scope.gamesToJoin=[];

        http.get('/game/list').then(function (response) {
            scope.gamesToJoin=response.data;
        }).catch(function (response) {
            location.path('/player/panel');
        });

        scope.joinGame=function (id) {
            var params={"id" : id}
            console.log(id);

            http.post('/game/join', params, {
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).then(function (response) {
                location.path('/game/' + response.data.id);

                // retrieving player id data

                http.get('/player/logged').then(function (response) {
                    var temp = response.data
                    rootScope.playerId=temp.object.userName;
                    console.log(rootScope.playerId);
                }).catch(function (response) {
                    rootScope.playerId="error";
                });

            }).catch(function (response) {
                location.path('/player/panel');
            });
        }
    }]);

gameModule.controller('playerGamesController', ['$scope', '$http', '$location', '$routeParams',
    function (scope, http, location, routeParams) {

        scope.playerGames= [];

        http.get('/game/player/list').then(function (response) {
            scope.playerGames = response.data;
        }).catch(function (response) {
            location.path('/player/panel');
        });

        scope.loadGame = function (id) {
            location.path('/game/' + id);
        }
    }]);

gameModule.controller('gameController', ['$rootScope', '$routeParams', '$scope', '$http', 'filterFilter',
    function (rootScope, routeParams, scope, http, filterFilter) {
  
        scope.playerList = [
            { id: 1, code: '', symbol: 'Click Here', name: ''}
        ];
    
        scope.options = [];

        var gameStatus;
        getInitialData()

            function getInitialData() {
                http.get('/game/'+routeParams.id).then(function (response) {
                    scope.gameProperties = response.data;
                    gameStatus = scope.gameProperties.gameStatus;
                    getMoveHistory();
                }).catch(function (response) {
                    scope.errorMessage = "Failed to load game properties";
                });
            }

            function getMoveHistory() {
                scope.movesInGame= [];

                return http.get('/move/list').then(function (response) {
                    scope.movesInGame=response.data;
                    scope.playerMoves=[];

                    //fill the board with positions from the retrieved moves
                    angular.forEach(scope.movesInGame, function (move) {
                        scope.rows[move.boardRow-1][move.boardColumn-1].letter = move.playerPieceCode;
                    });
                }).catch(function (response) {
                    scope.errorMessage= "Failed to load moves in game"
                });
            }

            function checkPlayerTurn() {
                return http.get('/move/turn').then(function (response) {
                    scope.playerTurn=response.data;
                }).catch(function (response) {
                    scope.errorMessage="Failed to get the player turn"
                });
            }

            function getNextMove() {
                scope.nextMoveData=[]

                // Computer is a second player
                if(!scope.gameProperties.secondPlayer) {
                    http.get("/move/autocreate").then(function (response) {
                        scope.nextMoveData= response.data;
                        getMoveHistory().then(function () {
                            var gameStatus = scope.movesInGame[scope.movesInGame.length-1].gameStatus;
                            if (gameStatus!='IN_PROGRESS') {
                                alert(gameStatus)
                            }
                        });
                    }).catch(function (response) {
                        scope.errorMessage="Can't send move"
                    });
                }

                // Second player is a user
                else {
                    console.log(' another player\'s move');
                }
            }

            function checkIfBoardCellAvailable(boardRow, boardColumn) {

                for (var i=0; i<scope.movesInGame.length; i++) {
                    var move= scope.movesInGame[i];
                    if (move.boardColumn==boardColumn &&move.boardRow==boardRow) {
                        return false;
                    }
                }
                return true;
            }

            scope.rows = [
                [
                    {'id': '11', 'letter': '', 'class': 'box'},
                    {'id': '12', 'letter': '', 'class': 'box'},
                    {'id': '13', 'letter': '', 'class': 'box'}
                ],
                [
                    {'id': '21', 'letter': '', 'class': 'box'},
                    {'id': '22', 'letter': '', 'class': 'box'},
                    {'id': '23', 'letter': '', 'class': 'box'}
                ],
                [
                    {'id': '31', 'letter': '', 'class': 'box'},
                    {'id': '32', 'letter': '', 'class': 'box'},
                    {'id': '33', 'letter': '', 'class': 'box'}
                ]
            ];

            angular.forEach(scope.rows, function (row) {
                row[0].letter = row[1].letter = row[2].letter = '';
                row[0].class = row[1].class = row[2].class = 'box';
            });

            scope.markPlayerMove=function (column) {
                checkPlayerTurn().then(function () {

                    var boardRow = parseInt(column.id.charAt(0));
                    var boardColumn = parseInt(column.id.charAt(1));
                    var params = {'boardRow':boardRow,'boardColumn':boardColumn}

                    if (checkIfBoardCellAvailable(boardRow,boardColumn)==true){
                        // if player's turn
                        if (scope.playerTurn==true) {

                            http.post("/move/create",params, {
                                headers: {
                                    'Content-Type': 'application/json; charset=UTF-8'
                                }
                            }).then(function () {

                                getMoveHistory().then(function () {

                                    var gameStatus=scope.movesInGame[scope.movesInGame.length-1].gameStatus;
                                    if (gameStatus=='IN_PROGRESS') {
                                        getNextMove();
                                    }
                                    else {
                                        // we are currently handling it using the update function
                                        //alert(gameStatus)
                                    }

                                    stompClient.send("/app/chat.sendMove/"+Id,
                                    {},
                                    JSON.stringify({sender: scope.playerId, type: 'MOVE'}))
                                    console.log(scope.playerId);
                                });
                            }).catch(function (response) {
                                scope.errorMessage = "Can't send the move"
                            });
                        }
                    }
                });
            };




            async function startGame(){

                showSnackbar();
                await sleep(5000);

                // TODO change this value based on the game type
                // Global state variables
                scope.missionNumber= [2,3,4,3,4];
                scope.initiatePlayer = scope.gameProperties.firstPlayer;
                scope.votingPool = [];
                scope.missionVotingPool = [];
                scope.approvePool = [];
                scope.rejectPool = [];
                scope.failPool = [];
                scope.votingTokens = [];
                scope.missionTokens = [];
                initiateTeamSelection(scope.initiatePlayer);

            }

            function refreshGameBoard(){
                // Alright so the idea is we have an array and then we call array.length and have have if statements which will show pictures
                var numVotingTokens = scope.votingTokens.length; 
                displayVotingTokens(numVotingTokens);
                displayMissionTokens(scope.missionTokens);
            }

            async function initiateTeamSelection(player){
                await sleep(2000);
                console.log(scope);
                console.log(player);
                var initiatePlayer = player;
                var initiateTeam = []; 
                scope.numChecks = 0;
                scope.participantNumber= 0;
                scope.playerList= [
                    { id: 1, code: scope.gameProperties.firstPlayer.userName, symbol: scope.gameProperties.firstPlayer.userName, name: 'Player'},
                    { id: 2, code: scope.gameProperties.secondPlayer.userName, symbol: scope.gameProperties.secondPlayer.userName, name: 'Player'},
                    // TODO uncomment for larger games
                    //{ id: 3, code: scope.gameProperties.thirdPlayer.userName, symbol: scope.gameProperties.thirdPlayer.userName, name: 'Player'},
                    //{ id: 4, code: scope.gameProperties.fourthPlayer.userName, symbol: scope.gameProperties.fourthPlayer.userName, name: 'Player'},
                    //{ id: 5, code: scope.gameProperties.fifthPlayer.userName, symbol: scope.gameProperties.fifthPlayer.userName, name: 'Player'},
                    //{ id: 6, code: scope.gameProperties.sixthPlayer.userName, symbol: scope.gameProperties.sixthPlayer.userName, name: 'Player'}
                ];
                

                if (scope.playerId==initiatePlayer.userName){
                    
                    var missionNumber = 6 - scope.missionNumber.length;
                    var participantNumber = scope.missionNumber.shift();
                    scope.participantNumber=participantNumber;
                    //create a modal that has checkboxes and perform form validation 
                    showInitiateTeamModal(missionNumber, participantNumber);
                
                    scope.toggleSelect = function(index) {
                        scope.playerList[index].checked = !scope.playerList[index].checked;
                        if (scope.playerList[index].checked==true){
                            scope.numChecks++;
                        } else {
                            scope.numChecks--;
                        }
                    };

                    scope.submit = function() {
                        for (var i=0; i<scope.playerList.length; i++) {
                            if (scope.playerList[i].checked == true){
                                initiateTeam.push(scope.playerList[i].symbol);
                            }
                        }
                        console.log(initiateTeam);
                        stompClient.send("/app/chat.proposeTeam/"+Id,
                                    {},
                                    JSON.stringify({sender: scope.playerId, type: 'PROPOSE_TEAM', players:initiateTeam}))
                        hideInitiateTeamModal();
                        
                    };
                    
                    
                } else {
                    // TODO create a temporary loading screen for other players while user makes decision
                }
            }

            scope.voteTeam= async function(players){
                // Display a Modal for all players prompting them to vote on the initiateTeam proposed 
                showVotingModal(players);
                scope.initiateTeam = players;   // This updates the scope variables for all users so that we can manipulate it                
            };

            scope.voteTeamImpl = async function(vote){
                scope.votingPool.push(vote);
            };

            scope.voteMissionImpl = async function(vote){
                scope.missionVotingPool.push(vote);
            };

            scope.startMission = async function(players){
                players.forEach(function(player){
                    if (player == scope.playerId){
                        // This means that the current player is participating in the mission -- display the mission Modal 
                        showMissionModal();
                    }
                })
            }

            scope.checkVoteTeam = async function(){
                // TODO change this in the future
                if (scope.votingPool.length == 2) {             // This is the inital condition it should be length=number of players
                    console.log('Finished collecting votes'); 
                    scope.votingPool.forEach(function(vote){
                        if (vote == "REJECT"){
                            scope.rejectPool.push(vote);
                        } else {
                            scope.approvePool.push(vote);
                        }
                    });

                    
                    if (scope.approvePool.length>scope.rejectPool.length){  // Only go ahead if there are move approves than rejects 
                        console.log('Approved! Sending Players on the Mission')
                        // resetting the voting tokens 
                        scope.votingTokens.length = 0; 
                        refreshGameBoard();

                        if (scope.playerId==scope.initiatePlayer.userName){
                            // Only the initiating Player sends the approve team message 
                            stompClient.send("/app/chat.sendGameInfo/"+Id,
                                    {},
                                    JSON.stringify({type: 'APPROVE_TEAM', content:"The Team has been Approved: ", scopeIntArray: scope.missionNumber, players: scope.initiateTeam}))
                        }

                    } else {
                        console.log('Rejected! Adding a failed piece to the board and restarting the voting process');
                        scope.votingTokens.push("Token"); 
                        refreshGameBoard();

                        // Since the team was rejected we can just push scope.participantNumber back onto scope.missionNumber and pass to everyone
                        scope.missionNumber.unshift(scope.participantNumber);

                        if (scope.playerId==scope.initiatePlayer.userName){
                            // Only the initiating Player sends the reject team message
                            stompClient.send("/app/chat.sendGameInfo/"+Id,
                                    {},
                                    JSON.stringify({type: 'REJECT_TEAM', content:"The Team has been Rejected", scopeIntArray: scope.missionNumber}))
                            
                                    // ALSO PROBABLY WANT TO SHOW WHO IS PROPOSING THE TEAMS 

                            // ALSO NEED A WAY TO PASS THE CURRENT MISSION STATUS VARIABLE TO ALL PLAYERS IE PASS SCOPE.MISSIONNUMBER -- IMPORTANT
                        }
                        hideInitiateTeamModal();
                    }

                    // Resetting the variables 
                    scope.votingPool.length = 0; 
                    scope.rejectPool.length = 0; 
                    scope.approvePool.length = 0; 
                    //scope.initiateTeam.length = 0;
                }
            };


            scope.checkVoteMission = async function(){
                console.log(scope);
                // TODO change this in the future
                if (scope.missionVotingPool.length == 2) {   // This is the inital condition it should be length=number of players
                    console.log('Finished collecting votes'); 
                    scope.missionVotingPool.forEach(function(vote){
                        if (vote == "FAIL"){
                            scope.failPool.push(vote);
                        } 
                    });

                    if (scope.failPool.length==0){  // Only go ahead if there are no failed votes  
                        console.log('PASSED! Mission was a success')

                        // resetting the voting tokens 
                        scope.missionTokens.unshift("SUCCESS"); 
                        refreshGameBoard();

                        if (scope.playerId==scope.initiatePlayer.userName){
                            // Only the initiating Player sends the success mission message 
                            stompClient.send("/app/chat.sendGameInfo/"+Id,
                                    {},
                                    JSON.stringify({type: 'SUCCESS_MISSION', content:"The Mission has Passed", scopeIntArray: scope.missionNumber, players: scope.initiateTeam}))
                            
                        }

                    } else {
                        console.log('FAIL! Mission was not a success');
                        scope.missionTokens.unshift("FAIL");
                        refreshGameBoard();

                        if (scope.playerId==scope.initiatePlayer.userName){
                            // Only the initiating Player sends the fail mission message
                            stompClient.send("/app/chat.sendGameInfo/"+Id,
                                    {},
                                    JSON.stringify({type: 'FAIL_MISSION', content:"The Mission has Failed", scopeIntArray: scope.missionNumber, players: scope.initiateTeam}))
                            
                        }
                        hideInitiateTeamModal();
                    }

                    // Resetting the variables 
                    scope.missionVotingPool.length = 0; 
                    scope.failPool.length = 0;  
                    //scope.initiateTeam.length = 0;
                }
            };

            scope.nextPlayer = async function(){
                // TODO this is written for six player game and needs to be updated for other game modes 
                if (scope.initiatePlayer == scope.gameProperties.firstPlayer){
                    scope.initiatePlayer = scope.gameProperties.secondPlayer;
                } else if (scope.initiatePlayer == scope.gameProperties.secondPlayer){
                    // remove this for actual game
                    
                    scope.initiatePlayer = scope.gameProperties.firstPlayer;

                    //scope.initiatePlayer = scope.gameProperties.thirdPlayer;
                } else if (scope.initiatePlayer == scope.gameProperties.thirdPlayer){
                    scope.initiatePlayer = scope.gameProperties.fourthPlayer;
                } else if (scope.initiatePlayer == scope.gameProperties.fourthPlayer) {
                    scope.initiatePlayer = scope.gameProperties.fifthPlayer;
                } else if (scope.initiatePlayer == scope.gameProperties.fifthPlayer) {
                    scope.initiatePlayer = scope.gameProperties.sixthPlayer;
                } else if (scope.initiatePlayer == scope.gameProperties.sixthPlayer) {
                    scope.initiatePlayer = scope.gameProperties.firstPlayer; 
                } else {
                    // currently does not handle other cases but it should 
                }
                console.log(scope.initiatePlayer);
                initiateTeamSelection(scope.initiatePlayer);
            }


            scope.update= async function() {
                await sleep(300);
                http.get('/move/list').then(function (response) {
                    scope.movesInGame=response.data;
                    scope.playerMoves=[];

                    //fill the board with positions from the retrieved moves
                    angular.forEach(scope.movesInGame, function (move) {
                        scope.rows[move.boardRow-1][move.boardColumn-1].letter = move.playerPieceCode;
                    });
                    var gameStatus=scope.movesInGame[scope.movesInGame.length-1].gameStatus;
                    if (gameStatus=='IN_PROGRESS') {
                        // Don't need to do anything
                    }
                    else {
                        alert(gameStatus)
                    }
                }).catch(function (response) {
                    scope.errorMessage= "Failed to load moves in game"
                });
                console.log(scope.movesInGame);
            }

            scope.updateConfig= async function() {
                await sleep(1000);
                http.get('/game/'+routeParams.id).then(function (response) {
                    scope.gameProperties = response.data;
                    gameStatus = scope.gameProperties.gameStatus;
                    console.log(response.data);
                    console.log("above");
                    if (gameStatus=="IN_PROGRESS") {
                        console.log("Starting Game");
                        startGame();
                    }
                }).catch(function (response) {
                    scope.errorMessage = "Failed to load game properties";
                });
            }

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            

    }]);