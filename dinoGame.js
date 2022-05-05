var gcanvas;
var gctx;

var playstate = 0; //0=no play, 1=playing, 2=win, 3=loss
var bg;
var lastRender = 0;
var gameLoop = setInterval(empty(), 60);

let dIndex = 0;

const gameWidth = 1000;
const gameHeight = 600;

var timeSinceLastObstacle;
var timeTillNextObstacle;

var obstacles = [
    {posX: gameWidth, used: false, width: 0, height: 0, dtf:0},
    {posX: gameWidth, used: false, width: 0, height: 0, dtf:0},
    {posX: gameWidth, used: false, width: 0, height: 0, dtf:0},
    {posX: gameWidth, used: false, width: 0, height: 0, dtf:0},
    {posX: gameWidth, used: false, width: 0, height: 0, dtf:0}
];

const obstacleTypes = [
    {width:40, height:100, dtf:0, bias: 0.3},  //Kaktus
    {width:80, height:100, dtf:0, bias: 0.6},  //Kaktus*2
    {width:60, height:40, dtf:0, bias: 0.7}, //Vogel N
    {width:60, height:40, dtf:80, bias: 0.9},  //Vogel H
    {width:120, height:100, dtf:0, bias: 1}  //Kaktus*3   
];

const dinoProperties = {width: 60, height: 60, position: {x:150, y:395}};

const dinoAnim = [
    {sx: 0, sy: 0, px: 88, py: 94},
    {sx: 88, sy: 0, px: 88, py: 94},
    {sx: 88*2, sy: 0, px: 88, py: 94},
    {sx: 88*3, sy: 0, px: 88, py: 94}
];

const speedAmps = [
    {amp: 1,   score:0},
    {amp: 1.1, score:100},
    {amp: 1.2, score:200},
    {amp: 1.3, score:300},
    {amp: 1.5, score:400},
    {amp: 1.7, score:500},
    {amp: 1.9, score:600},
    {amp: 2.2, score:700},
    {amp: 2.5, score:800},
    {amp: 3,   score:900}
];

var currSpeedAmp = 1;

var jumping = false;
var dinoJumpHeight = [395,345,320,295,270,245,240,235,235,240,245,270,295,320,345,395];
var dinoJumpHeight0 = [395,345,320,295,270,245,240,235,235,240,245,270,295,320,345,395];
var dinoJumpHeight400 = [395,345,320,295,270,245,240,232,240,245,270,295,320,345,395];
var dinoJumpHeight700 = [395,330,295,270,245,235,232,235,245,270,295,330,395];

var jumpstart = dinoJumpHeight.length;

var score = 0;

function initializeCanvas() {
    document.getElementById("rr").style.visibility = "hidden";
    console.clear();
    gcanvas = document.getElementById("gameCanvas");
    gctx= gcanvas.getContext("2d");
    gctx.textBaseLine = "middle";
    gctx.textAlign = "center";
}

function beginPlay() {
    playstate = 1;
    clearInterval(gameLoop);
    currSpeedAmp = 1;
    dinoJumpHeight=dinoJumpHeight0;
    score = 0;
    bg = document.getElementById("bg");
    gctx.drawImage(bg, 0, 400, gameWidth, 100);
    for(var i = 0; i<obstacles.length; i++) {
        obstacles[i].posX = 1000;
        obstacles[i].used = false;
    }   
    timeSinceLastObstacle = 0;
    timeTillNextObstacle = 500;
    draw();
    gameLoop = setInterval(draw, 60);   
}

function draw() {
    for(var i = 0; i<speedAmps.length; i++) {
        if(score>speedAmps[i].score) currSpeedAmp = speedAmps[i].amp;
        if(currSpeedAmp==1.5) dinoJumpHeight=dinoJumpHeight400;
        if(currSpeedAmp==2.2) dinoJumpHeight=dinoJumpHeight700;
    }

    if(score >= 1500) {
        playstate = 2;
        gctx.textAlign = "center";
        gctx.clearRect(0, 0, gameWidth, gameHeight);
        gctx.font = "200px ＭＳ Ｐゴシック";      
        gctx.fillText("1 2 3 4 5 6", gameWidth/2, gameHeight/2+100);
        clearInterval(gameLoop);
        gameLoop = setInterval(empty, 60);
        return;
    }

    if(collisionCheck()) {
        playstate = 3;
        gctx.textAlign = "center";
        gctx.clearRect(0, 0, gameWidth, gameHeight);
        gctx.font = "200px ＭＳ Ｐゴシック";      
        gctx.fillText("Try Again", gameWidth/2, gameHeight/2+100);
        clearInterval(gameLoop);
        gameLoop = setInterval(empty, 60);
        gcanvas.style.visibility = "hidden";
        document.getElementById("rr").style.visibility = "visible";
        document.getElementById("rr").style.position = "fixed";
        document.getElementById("rr").style.left = "0px";
        //window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank").focus();
        return;
    }

    gctx.clearRect(0, 0, gameWidth, gameHeight);
    gctx.drawImage(bg, 0, 400, gameWidth, 100);    

    if(timeSinceLastObstacle >= timeTillNextObstacle) {
        timeSinceLastObstacle = 0;
        timeTillNextObstacle = 1000 * (Math.random()/2+0.5)
        for(var i = 0; i<obstacles.length; i++) {
            if(obstacles[i].used == false) {
                var obstacleType = null;
                var randNum = Math.random();
                console.log(randNum);
                for(var d = 0; d<obstacleTypes.length; d++) {
                    if(randNum<obstacleTypes[d].bias && obstacleType == null) {
                        obstacleType = obstacleTypes[d];
                        console.log(d);
                    }
                }
                if(obstacleType==null) obstacleType = obstacleTypes[4];
                obstacles[i].used = true;
                obstacles[i].height = obstacleType.height;
                obstacles[i].width = obstacleType.width;
                obstacles[i].dtf = obstacleType.dtf;
                console.log("Spawned Obstacle");
                break;
            }
        }
    } 

    timeSinceLastObstacle = timeSinceLastObstacle + (25*currSpeedAmp);
   
    if(jumping == false) {
        gctx.drawImage(document.getElementById("dinoWalk"), dinoAnim[dIndex].sx, dinoAnim[dIndex].sy, dinoAnim[dIndex].px, dinoAnim[dIndex].py, dinoProperties.position.x, dinoProperties.position.y, dinoProperties.width, dinoProperties.height);
        dIndex++;
        if(dIndex >= dinoAnim.length) dIndex = 0;
    } else if(jumpstart < dinoJumpHeight.length){
        dinoProperties.position.y = dinoJumpHeight[jumpstart]; 
        gctx.drawImage(document.getElementById("dinoWalk"), dinoAnim[dIndex].sx, dinoAnim[dIndex].sy, dinoAnim[dIndex].px, dinoAnim[dIndex].py, dinoProperties.position.x, dinoProperties.position.y, dinoProperties.width, dinoProperties.height);       
        
         jumpstart++;
        
        if(jumpstart >= dinoJumpHeight.length) {
            jumpstart = 0;
            jumping = false;
        } 
    }

    for(var i = 0; i<obstacles.length; i++) {
        if(obstacles[i].used == true) {
            obstacles[i].posX = obstacles[i].posX-(20*currSpeedAmp);
            if(obstacles[i].posX <= 0) {
                obstacles[i].used = false;
                obstacles[i].posX = gameWidth;
            } else {
                gctx.beginPath();
                gctx.rect(obstacles[i].posX, 360 - obstacles[i].dtf, obstacles[i].width, obstacles[i].height);
                gctx.stroke();
            }   
        }   
    }

    var grdR = gctx.createLinearGradient(0, 0, 200, 0);
    grdR.addColorStop(0,"gray");
    grdR.addColorStop(0.5,"white");

    gctx.fillStyle = grdR;
    gctx.fillRect(0, 0, 100, gameHeight);

    gctx.fillStyle = "black";
    gctx.textAlign = "left";
    gctx.font = "50px ＭＳ Ｐゴシック";
    gctx.fillText("Score:" + score, 10, 50);
    score = score+1;

}

function input() {
    switch (playstate){
        case 0:
            beginPlay();
            break;
        case 1:
            if(jumping == false) {
                jumping = true;
                jumpstart = 0;
            } 
            break;
        case 2:
            console.log("win");
            break;
        case 3:
            beginPlay();
            break;
        default:
            console.log("undefined playstate (" + playstate + ") | expected:0-3");
            break;
    } 
}

function collisionCheck() {
    var dinoPos = dinoProperties.position;
    for(var i = 0; i<obstacles.length; i++) {
        var obstacle = obstacles[i];
        if(
            dinoPos.x < obstacle.posX + obstacle.width &&
            dinoPos.x + dinoProperties.width > obstacle.posX &&
            dinoPos.y < 360-obstacle.dtf + obstacle.height &&
            dinoProperties.height + dinoPos.y > 360-obstacle.dtf
        ) return true;
    }
    return false;
}

function empty() {

}

