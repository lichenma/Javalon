'use strict';
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var usernamePage = document.querySelector('#username-page');
var gamePage = document.querySelector('#game-page');

// Get the character modal
var modal = document.getElementById('myModal');
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
var span = document.getElementsByClassName("close")[0];

// Get the initiate Team modal 
var initiateModal = document.getElementById('initiateMyModal');
var initiateModalImg = document.getElementById("initiateImg01");
var initiateCaptionText = document.getElementById("initiateCaption");

// Get the voting Team modal 
var votingModal = document.getElementById('votingModal');
var votingApproveImg = document.getElementById("votingImg01");
var votingRejectImg = document.getElementById("votingImg02");
var votingCaptionText = document.getElementById("votingCaption");

// Get the mission modal 
var missionModal = document.getElementById('missionModal');
var missionSuccessImg = document.getElementById("missionImg01");
var missionFailImg = document.getElementById("missionImg02");
var missionCaptionText = document.getElementById("missionCaption");


// Get the voting tokens 
var votingToken1 = document.getElementById('votingToken1');
var votingToken2 = document.getElementById('votingToken2');
var votingToken3 = document.getElementById('votingToken3');
var votingToken4 = document.getElementById('votingToken4');
var votingToken5 = document.getElementById('votingToken5');

// Get the mission tokens 
var missionToken1 = document.getElementById('missionToken1');
var missionToken2 = document.getElementById('missionToken2');
var missionToken3 = document.getElementById('missionToken3');
var missionToken4 = document.getElementById('missionToken4');
var missionToken5 = document.getElementById('missionToken5');

// When the user clicks on <span> (x), close the modal
span.onclick = function() { 
  modal.style.display = "none";
}


var stompClient = null;
var username=null;
var Id=null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];


async function connect() {
    await sleep(300);
    const Url = '/player/logged'; 
    console.log(Url);
    $.ajax({
        url: Url,
        type:"GET",
        success: function(data){
            username=data.object.userName;

            if(username){

                //usernamePage.classList.add('hidden');
                //gamePage.classList.remove('hidden');
                var socket = new SockJS('/ws');
                stompClient = Stomp.over(socket);
                stompClient.connect({}, onConnected, onError);
            }
        },
        error: function(error){
            console.log(`Error ${error}`);
        }
    })
    //username= document.querySelector('#name').value.trim();
}


function onConnected() {
    //////////////////////////////////////////////////////////////////////////////////
    // the topic we subscribe to will be determined from the url - namely the game Id 
    // we can write up a service call to get it but I don't know if we ened it
    //////////////////////////////////////////////////////////////////////////////////
    
    var Url= window.location.href;
    Id = Url.substring(Url.lastIndexOf("/")+1, Url.length);

    // subscribe to the specific game topic
    stompClient.subscribe('/topic/'+Id, onMessageReceived);

    // send username to server
    stompClient.send("/app/chat.addUser/"+Id,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    angular.element(document.getElementById('game-page')).scope().playerId = username;
}


function onError(error) {

}


function sendMessage(event) {

    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {

        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage/"+Id, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }

    event.preventDefault();
}


function onMessageReceived(payload) {

    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    messageElement.style.fontSize= '0.8em';
    if (message.type === 'JOIN') {

        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';

        console.log(angular.element(document.getElementById('game-page')).scope());
        angular.element(document.getElementById('game-page')).scope().updateConfig();
        angular.element(document.getElementById('game-page')).scope().$apply();

    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content=message.sender + ' left!';

    } else if (message.type === 'MOVE') {
        messageElement.classList.add('event-message');
        message.content=message.sender + ' made a move!';

        console.log(angular.element(document.getElementById('game-page')).scope());
        angular.element(document.getElementById('game-page')).scope().update();
        angular.element(document.getElementById('game-page')).scope().$apply();

    } else if (message.type === "PROPOSE_TEAM"){
        messageElement.classList.add('event-message');
        message.content=message.sender + ' proposed a team: '+message.players;

        angular.element(document.getElementById('game-page')).scope().voteTeam(message.players);
        angular.element(document.getElementById('game-page')).scope().$apply();
    } else if (message.type === "VOTE_TEAM"){
        messageElement.classList.add('event-message');
        var vote = message.content;
        message.content=message.sender + ' voted on the team: '+message.content;

        angular.element(document.getElementById('game-page')).scope().voteTeamImpl(vote);
        angular.element(document.getElementById('game-page')).scope().checkVoteTeam();
        angular.element(document.getElementById('game-page')).scope().$apply();
    } else if (message.type === "REJECT_TEAM"){
        messageElement.classList.add('event-message');
        angular.element(document.getElementById('game-page')).scope().missionNumber = message.scopeIntArray;
        angular.element(document.getElementById('game-page')).scope().nextPlayer();
        angular.element(document.getElementById('game-page')).scope().$apply();    
            // TODO 
            // here you want to update the initiating player and go on
    } else if (message.type === "APPROVE_TEAM"){
        messageElement.classList.add('event-message');
        message.content = message.content + message.players; 
        angular.element(document.getElementById('game-page')).scope().missionNumber = message.scopeIntArray;
        angular.element(document.getElementById('game-page')).scope().startMission(message.players);
    } else if (message.type === "VOTE_MISSION") {
        messageElement.classList.add('event-message');
        var missionVote = message.content; 
        message.content = message.sender + ' voted on the team: '+message.content; 

        angular.element(document.getElementById('game-page')).scope().voteMissionImpl(missionVote);
        angular.element(document.getElementById('game-page')).scope().checkVoteMission();
        angular.element(document.getElementById('game-page')).scope().$apply();
    } else if (message.type === "SUCCESS_MISSION"){
        messageElement.classList.add('event-message');

        angular.element(document.getElementById('game-page')).scope().missionNumber = message.scopeIntArray;
        angular.element(document.getElementById('game-page')).scope().nextPlayer();
        angular.element(document.getElementById('game-page')).scope().$apply(); 
    } else if (message.type === "FAIL_MISSION"){
        messageElement.classList.add('event-message');

        angular.element(document.getElementById('game-page')).scope().missionNumber = message.scopeIntArray;
        angular.element(document.getElementById('game-page')).scope().nextPlayer();
        angular.element(document.getElementById('game-page')).scope().$apply(); 
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {

    var hash = 0;
    for (var i=0; i<messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index=Math.abs(hash % colors.length);
    return colors[index];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
//messageForm.addEventListener('submit', connect, true);
connect();


function showCharacter() {
    var page= window.location.href;
    Id = page.substring(page.lastIndexOf("/")+1, page.length);
    const Url = '/game/character/'+Id; 
    console.log(Url);
    $.ajax({
        url: Url,
        type:"GET",
        success: function(data){
            var character = data;
            if(character){
                // Handle the logic for displaying the character

                // TODO add in a method for allowing the assassin to assinate people
                // TODO run a trial 
                
                // currently finding the player roles is done client side
                var scope=angular.element(document.getElementById('game-page')).scope();
                scope = scope.gameProperties;
                console.log(scope);
                var merlin = null; 
                var assassin = null; 
                var villager = null; 
                var morgana = null; 
                var percival = null; 

                if (scope.firstPlayerCharacter=="MERLIN"){
                    merlin = scope.firstPlayer.userName;     
                } else if (scope.firstPlayerCharacter=="ASSASSIN"){
                    assassin = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="VILLAGER"){
                    villager = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="MORGANA"){
                    morgana = scope.firstPlayer.userName;
                } else if (scope.firstPlayerCharacter=="PERCIVAL"){
                    percival = scope.firstPlayer.userName;
                }
                
                if (scope.secondPlayerCharacter=="MERLIN"){
                    merlin = scope.secondPlayer.userName;     
                } else if (scope.secondPlayerCharacter=="ASSASSIN"){
                    assassin = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="VILLAGER"){
                    villager = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="MORGANA"){
                    morgana = scope.secondPlayer.userName;
                } else if (scope.secondPlayerCharacter=="PERCIVAL"){
                    percival = scope.secondPlayer.userName;
                }

                if (scope.thirdPlayerCharacter=="MERLIN"){
                    merlin = scope.thirdPlayer.userName;     
                } else if (scope.thirdPlayerCharacter=="ASSASSIN"){
                    assassin = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="VILLAGER"){
                    villager = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="MORGANA"){
                    morgana = scope.thirdPlayer.userName;
                } else if (scope.thirdPlayerCharacter=="PERCIVAL"){
                    percival = scope.thirdPlayer.userName;
                }

                if (scope.fourthPlayerCharacter=="MERLIN"){
                    merlin = scope.fourthPlayer.userName;     
                } else if (scope.fourthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="VILLAGER"){
                    villager = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="MORGANA"){
                    morgana = scope.fourthPlayer.userName;
                } else if (scope.fourthPlayerCharacter=="PERCIVAL"){
                    percival = scope.fourthPlayer.userName;
                }

                if (scope.fifthPlayerCharacter=="MERLIN"){
                    merlin = scope.fifthPlayer.userName;     
                } else if (scope.fifthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="VILLAGER"){
                    villager = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="MORGANA"){
                    morgana = scope.fifthPlayer.userName;
                } else if (scope.fifthPlayerCharacter=="PERCIVAL"){
                    percival = scope.fifthPlayer.userName;
                }

                if (scope.sixthPlayerCharacter=="MERLIN"){
                    merlin = scope.sixthPlayer.userName;     
                } else if (scope.sixthPlayerCharacter=="ASSASSIN"){
                    assassin = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="VILLAGER"){
                    villager = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="MORGANA"){
                    morgana = scope.sixthPlayer.userName;
                } else if (scope.sixthPlayerCharacter=="PERCIVAL"){
                    percival = scope.sixthPlayer.userName;
                }

                //TODO add in a check so that you can only see when gameStatus = IN_PROGRESS
                modal.style.display = "block";
                if (character == "MERLIN") {
                    modalImg.src = "../images/Merlin.jpg";
                    var firstDisplay = null;
                    var secondDisplay = null; 

                    // need to randomize 
                    if (Math.floor((Math.random() * 2) + 1)==1){
                        firstDisplay = morgana;
                        secondDisplay = assassin;
                    } else {
                        firstDisplay = assassin;
                        secondDisplay = morgana;
                    }
                    
                    captionText.innerHTML = "Members of Team Evil: <strong>" + firstDisplay + " " + secondDisplay + "</strong>";
                } else if (character == "ASSASSIN") {
                    modalImg.src = "../images/Assassin.jpg";
                    captionText.innerHTML = "Try to Find and Assassinate Merlin <br> Members of Team Evil: <strong>" + morgana + "</strong";
                    // add in a button which displays a form that allows the user to at any moment assassinate another player 
                    // submitting the form should trigger an websockets message and game end condition 
                } else if (character == "MORGANA") {
                    modalImg.src = "../images/Morgana.png";
                    captionText.innerHTML = "Try to Trick Percival into Thinking you are Merlin <br> Members of Team Evil: <strong>" + assassin + "</strong>";
                } else if (character == "VILLAGER") {
                    modalImg.src = "../images/Villager.jpg";
                    captionText.innerHTML = "Ignorance is Bliss";
                } else if (character == "PERCIVAL") {
                    // need to randomize 
                    if (Math.floor((Math.random() * 2) + 1)==1){
                        firstDisplay = merlin;
                        secondDisplay = morgana;
                    } else {
                        firstDisplay = morgana;
                        secondDisplay = merlin;
                    }

                    modalImg.src = "../images/Percival.png";
                    captionText.innerHTML = "Try to Protect Merlin <br> People who may be Merlin or Morgana: <strong>" + firstDisplay + " " + secondDisplay + "</strong>";
                } else if (character == "VILLAGER_1") {
                    modalImg.src = "../images/Villager_1.png";
                    captionText.innerHTML = "Ignorance is Bliss";
                } else {
                    // something went wrong
                }
            }
        },
        error: function(error){
            console.log(`Error ${error}`);
        }
    })
}

function hideCharacter() {
    //modal.style.display = "none";
}

function showSnackbar() {

    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function hideSnackbar() {
    //TODO might want to be able to dismiss the snackbar by presssing it
    var x = document.getElementById("snackbar");
    x.className=x.className.replace("show","");
}

function showInitiateTeamModal(missionNumber, participantNumber){
    initiateModal.style.display = "block";
    //initiateModalImg.src = "../images/Morgana.png";
    initiateCaptionText.innerHTML = "This is Mission Number: " + missionNumber + "<br> You Need to Bring: " + participantNumber +" People";                   
}

function hideInitiateTeamModal(){
    initiateModal.style.display = "none";
}

function showVotingModal(initiateTeam){
    votingModal.style.display = "block";
    //initiateModalImg.src = "../images/Morgana.png";
    votingCaptionText.innerHTML = "The Proposed Team is: " +initiateTeam + " Please Vote";
    votingApproveImg.src = "../images/approve.jpg";
    votingRejectImg.src="../images/reject.jpg";
}

function hideVotingModal(initiateTeam){
    votingModal.style.display="none";
}

function sendApprove(){
    var scope = angular.element(document.getElementById('game-page')).scope();
    stompClient.send("/app/chat.voteTeam/"+Id,
                {},
                JSON.stringify({sender: scope.playerId, type: 'VOTE_TEAM', content: 'APPROVE'}));
    votingModal.style.display = "none";
}

function sendReject(){
    var scope = angular.element(document.getElementById('game-page')).scope();
    stompClient.send("/app/chat.voteTeam/"+Id,
                {},
                JSON.stringify({sender: scope.playerId, type: 'VOTE_TEAM', content: 'REJECT'}));
    votingModal.style.display = "none";
}


function displayVotingTokens(num){
    if (num==0){
        votingToken1.style.display="none";
        votingToken2.style.display="none";
        votingToken3.style.display="none";
        votingToken4.style.display="none";
        votingToken5.style.display="none";   
    } else if (num ==1){
        votingToken1.style.display="inline";
        votingToken2.style.display="none";
        votingToken3.style.display="none";
        votingToken4.style.display="none";
        votingToken5.style.display="none"; 
    } else if (num == 2){
        votingToken1.style.display="inline";
        votingToken2.style.display="inline";
        votingToken3.style.display="none";
        votingToken4.style.display="none";
        votingToken5.style.display="none"; 
    } else if (num == 3){
        votingToken1.style.display="inline";
        votingToken2.style.display="inline";
        votingToken3.style.display="inline";
        votingToken4.style.display="none";
        votingToken5.style.display="none"; 
    } else if (num==4){
        votingToken1.style.display="inline";
        votingToken2.style.display="inline";
        votingToken3.style.display="inline";
        votingToken4.style.display="inline";
        votingToken5.style.display="none"; 
    } else {
        votingToken1.style.display="inline";
        votingToken2.style.display="inline";
        votingToken3.style.display="inline";
        votingToken4.style.display="inline";
        votingToken5.style.display="inline";
        
        // This is a team evil win condition 
        angular.element(document.getElementById('game-page')).scope().gameStatus="Team Evil Wins";
        alert('TEAM EVIL WINS TOO MANY FAILED TEAM PROPOSALS IN A ROW');
        // sendTeamEvilWins();
    }
}

function displayMissionTokens(array){

    // check for game end conditions 
    var numSuccess=0;
    var numFail=0;

    // TODO make this work for multiple players as well 
    for (var i=0; i<array.length; i++){
        var tokenValue = array[i];
        if (tokenValue=="SUCCESS"){
            numSuccess++;
        } else {
            numFail++;
        }

        if (i==0){
            if (tokenValue=="SUCCESS"){
                missionToken1.style.display="inline";
                missionToken1.src = "../images/successToken.png"
            } else {
                missionToken1.style.display="inline";
                missionToken1.src = "../images/failToken.png";
            }
        } else if (i==1){
            if (tokenValue=="SUCCESS"){
                missionToken2.style.display="inline";
                missionToken2.src = "../images/successToken.png"
            } else {
                missionToken2.style.display="inline";
                missionToken2.src = "../images/failToken.png";
            }
        } else if (i==2){
            if (tokenValue=="SUCCESS"){
                missionToken3.style.display="inline";
                missionToken3.src = "../images/successToken.png"
            } else {
                missionToken3.style.display="inline";
                missionToken3.src = "../images/failToken.png";
            }
        } else if (i==3){
            if (tokenValue=="SUCCESS"){
                missionToken4.style.display="inline";
                missionToken4.src = "../images/successToken.png"
            } else {
                missionToken4.style.display="inline";
                missionToken4.src = "../images/failToken.png";
            }
        } else if (i==4){
            if (tokenValue=="SUCCESS"){
                missionToken5.style.display="inline";
                missionToken5.src = "../images/successToken.png"
            } else {
                missionToken5.style.display="inline";
                missionToken5.src = "../images/failToken.png";
            }
        } else if (i==5){
            if (tokenValue=="SUCCESS"){
                missionToken6.style.display="inline";
                missionToken6.src = "../images/successToken.png"
            } else {
                missionToken6.style.display="inline";
                missionToken6.src = "../images/failToken.png";
            }
        } else {
            // handle the other cases when necessary 
        }
    }

    // Game End Conditions 

    if (numSuccess == 3){
        alert('TEAM GOOD WINS - ASSASSIN HAS A CHANCE TO TAKE DOWN MERLIN');
    }

    if (numFail == 3){
        alert('TEAM EVIL WINS')
    } 
}


function showMissionModal(){
    missionModal.style.display = "block";
    missionCaptionText.innerHTML = "Please Vote - If you are a Member of Team Good you Must Vote Pass";
    missionSuccessImg.src = "../images/success.jpg";
    missionFailImg.src="../images/fail.jpg";
}

function hideMissionModal(){
    missionModal.style.display="none";
}

function sendSuccess(){
    var scope = angular.element(document.getElementById('game-page')).scope();
    stompClient.send("/app/chat.voteMission/"+Id,
                {},
                JSON.stringify({sender: scope.playerId, type: 'VOTE_MISSION', content: 'SUCCESS'}));
    missionModal.style.display = "none";
}

function sendFail(){
    var scope = angular.element(document.getElementById('game-page')).scope();
    stompClient.send("/app/chat.voteMission/"+Id,
                {},
                JSON.stringify({sender: scope.playerId, type: 'VOTE_MISSION', content: 'FAIL'}));
    missionModal.style.display = "none";
}