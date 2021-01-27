
//declaring variables and assigning elements in DOM
var startBtn = document.getElementById('start-game'),
    attack = document.getElementById('atk'),
    usePot = document.getElementById('use-pot'),
    combatReport = document.getElementById('combat-report'),
    playerPots = document.getElementById('player-pots'),
    oppPots = document.getElementById('opp-pots'),
    playerTurn,
    player,
    opponent,
    playerHp = document.getElementById('player-hp'),
    oppHp = document.getElementById('opp-hp');

//Ensures combat report text content is blank if the game is refreshed.
combatReport.textContent = '';

//character constructor object
function Character() {
    this.health = 100;
    this.potions = 2;
}


//function sets up the game for a new player.
function start() {
    
    var hideStart = document.getElementsByClassName('start-screen'),
        gameScreen = document.getElementsByClassName('game-screen'),
        gameBG = document.getElementsByClassName('game'),
        i;
    
    //hides the start menu once game starts
    hideStart[0].style.display = "none";
    
    //shows game screen
    gameScreen[0].style.display = "flex";
    
    //changes bg image for game screen by switching its class
    gameBG[0].className = 'play';
    
    //creates both player objects for the game using constructor notation
    player = new Character();
    opponent = new Character();
    
    //creates an additional property of the opponent object to randomize the usage of potions
    opponent.usePotThreshold = Math.floor((Math.random() * (40 - 20 + 1)) + 20);
    
    //random selection of first turn.
    playerTurn = Math.floor((Math.random() * 2) + 1);
    
    //sets message for who goes first
    if (playerTurn === 1) {
        combatReport.textContent = 'You get the first turn!';
    } else {
        combatReport.textContent = 'Your opponent goes first!';
    }
    
    //starts the game clock
    gameClock();
    
}

//allows start button to fire start function.
startBtn.addEventListener('click', start);


//checks current turn and switches it
function switchTurn() {
    //if player turn is 3 (no one) change to opp. if opponent then change to player
    if (playerTurn === 3) {
        playerTurn = 2;
    } else {
        playerTurn = 1;
    }
}


//calculates damage done and subtracts value from target player object
function attackDmg(playerTurn) {
    
    if (playerTurn === 1) {
        var dmgDone = Math.floor((Math.random() * (20 - 14 + 1)) + 14);
        
        opponent.health = opponent.health - dmgDone;
        combatReport.textContent += dmgDone;
        
    } else {
        var dmgDone = Math.floor((Math.random() * (20 - 14 + 1)) + 14);
        
        player.health = player.health - dmgDone;
        combatReport.textContent += dmgDone;
    }
}

/*calculates if an attack was blocked, if not the attackDmg function is called.
this function also updates the combatReport with the what is happening*/
function block() {
    
    //doesn't allow player to spam attack or use a potion after function is called!
    attack.removeEventListener('click', block);
    
    usePot.removeEventListener('click', usePotion);
    
    var blkChance;
    
    if (playerTurn === 1) {
        //randomly selects a number between 1-100
        blkChance = Math.floor((Math.random() * 100) + 1);
        
        //if that number is 15 or less then the block was successful.
        if (blkChance <= 15) {
            combatReport.textContent = 'Your opponent blocks!';
            //sets player turn to 3 which causes gameState function to be false
            //this allows no one to spam attack and enough time for messages to appear on screen
            playerTurn = 3;
            setTimeout(switchTurn, 3000);
        } else {
            combatReport.textContent = 'You strike for ';
            attackDmg(playerTurn);
            combatReport.textContent += ' damage!';
            //sets player turn to 3 which causes gameState function to be false
            //this allows no one to spam attack and enough time for messages to appear on screen
            playerTurn = 3;
            setTimeout(switchTurn, 3000);
        }
    } else {
        //same blocking logic for whether the player blocks. see above
        blkChance = Math.floor((Math.random() * 100) + 1);
        
        if (blkChance <= 15) {
            combatReport.textContent = 'You blocked the attack!';
            switchTurn();
        } else {
            combatReport.textContent = 'Opponent attacks for ';
            attackDmg(playerTurn);
            combatReport.textContent += ' dmg!';
            switchTurn();
        }
    }
}

/*calculates how much (if any) a character will be healed by a potion.
logic also checks if a character object has potions and updates combatReport with events*/
function usePotion() {
    
    var amtHealed = 30,
        hpNoHeal;
    
    if (playerTurn === 1) {
        if (player.potions > 0) {
            if (player.health === 100) {
                combatReport.textContent = "You have full health already!";
            } else {
                hpNoHeal = player.health;
                
                if ((hpNoHeal + amtHealed) > 100) {
                    //Doesn't allow player to heal past 100
                    amtHealed = amtHealed - ((hpNoHeal + amtHealed) - 100);
                    
                    //removes event listeners after player successfully uses potion
                    usePot.removeEventListener('click', usePotion);
        
                    attack.removeEventListener('click', block);
                    
                    player.health = player.health + amtHealed;
                    combatReport.textContent = "The potion heals for ";
                    combatReport.textContent += amtHealed;
                    player.potions = player.potions - 1;
                    
                    //keeps player from spam using potions switches actual turns after a delay
                    playerTurn = 3;
                    setTimeout(switchTurn, 3000);
                } else {
                    //removes event listeners after player successfully uses potion
                    usePot.removeEventListener('click', usePotion);
                    
                    attack.removeEventListener('click', block);
                    
                    player.health = player.health + amtHealed;
                    combatReport.textContent = "The potion heals for ";
                    combatReport.textContent += amtHealed;
                    player.potions = player.potions - 1;
                    
                    //keeps player from spam using pots. switches actual turns after a delay
                    playerTurn = 3;
                    setTimeout(switchTurn, 3000);
                }
            }
        } else {
            combatReport.textContent = "You are out of potions!";
        }
        
    } else {
        opponent.health = opponent.health + amtHealed;
        combatReport.textContent = "Opponents potion heals for ";
        combatReport.textContent += amtHealed;
        opponent.potions = opponent.potions - 1;
        switchTurn();
    }
}


// start function is the heart of the game. It fires the gameState function and continues to fire
// that function every second. This allows us to check the state of the game to keep everything
//up to date once the condition is found false stopClock is called from gameState which clears the interval function.

var startClock;

function gameClock() {
    startClock = setInterval(gameState, 1000);
    
}

function stopClock() {
    //stops the clock from running once game ends. Keeps memory from continuously being used
        clearInterval(startClock);
    }

/*The gameState function is called frequently and allows the browser to look at current health/potions/turn and keeps them up to date. It also allows the logic of the game to be carried out. When a character object reaches <= 0 health. The statement becomes false and we fire the stopClock function ending the game.*/
function gameState() {
    
    playerHp.textContent = player.health;
    playerPots.textContent = player.potions;
    oppHp.textContent = opponent.health;
    oppPots.textContent = opponent.potions;
    
    
    if (player.health > 0 && opponent.health > 0) {
        if (playerTurn === 1) {
            //adds event listeners for player to take action. Only added on players turn.
            attack.addEventListener('click', block);
            usePot.addEventListener('click', usePotion);
        } else if (playerTurn === 2) {
            
            //basic logic allows opponent to decide to use a potion or attack.
            if (opponent.health <= opponent.usePotThreshold && opponent.potions > 0) {
                usePotion();
            } else {
                block();
            }
            
        }
        
    } else {
        if (player.health <= 0) {
            //removes event listeners so player can't click once game completes
            attack.removeEventListener('click', block);
            usePot.removeEventListener('click', usePotion);
            combatReport.textContent = 'You were slain!';
            stopClock();
        } else {
            //removes event listeners so player can't click once game completes
            attack.removeEventListener('click', block);
            usePot.removeEventListener('click', usePotion);
            combatReport.textContent = "You were victorious!";
            stopClock();
        }
    }
}
