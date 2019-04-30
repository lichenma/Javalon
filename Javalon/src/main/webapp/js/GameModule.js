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

                // want to start off by displaying a snack bar saying that the needed
                // number of players have joined the game and that we will commence
                // once everyone has opened up their character modals 
                console.log("showing snackbar");
                showSnackbar();
                
                await sleep(5000);
                // initiate team selection with the first player- keep the button for 
                // displaying player characters
                
                // setup the number of people on each mission in a scope variable
                scope.missionNumber= [2,3,4,3,4];

                initiateTeamSelection(scope.gameProperties.firstPlayer);

            }

            function initiateTeamSelection(player){
                var initiatePlayer = player;
                var initiateTeam = []; 

                
                console.log(scope);

                if (scope.playerId==initiatePlayer.userName){
                    console.log("Made it");
                    // if the current player is the initiating player we want to show
                    // them the selection choices
                    
                    //create a modal that has checkboxes and perform form validation 
                    // Fruits
                    scope.fruits = [
                        { name: 'apple',    selected: true },
                        { name: 'orange',   selected: false },
                        { name: 'pear',     selected: true },
                        { name: 'naartjie', selected: false }
                    ];
                    
                    console.log("displaying propose team modal");
                    console.log(scope);
                    showInitiateTeamModal();

                    // Selected fruits
                    scope.selection = [];

                    // Helper method to get selected fruits
                    scope.selectedFruits = function selectedFruits() {
                        return filterFilter(scope.fruits, { selected: true });
                    };

                    // Watch fruits for changes
                    scope.$watch('fruits|filter:{selected:true}', function (nv) {
                        scope.selection = nv.map(function (fruit) {
                        return fruit.name;
                        console.log(fruit.name);
                        });
                    }, true);
                } else {
                    // if current player is not initiating player we want to show them
                    // another screen 
                    console.log("Did not make it");
                }
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
                console.log("made it ---------------------");
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