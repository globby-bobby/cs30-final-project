// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let drawPictures = true;
let drawHitboxes = true;

let canvas;
let font;

let hitboxArray = [];
let pickupArray = [];
let currentStageEnemyArray = [];
let testHitbox;

const MAX_HITBOX_COUNT = 1000;
const MAX_PICKUP_COUNT = 200;

let stage = 1;
let state = 'game';
let betweenStages = false;
let isPlayerMovable = true;

let spawnpos = 0;
let playerX = 0;
let playerY = 0;
let bringPickupsToPlayer = false;
const DEFAULT_PLAYER_MOVESPEED = 4;
const SHIFT_PLAYER_MOVESPEED = 2;
const PLAYER_HITBOX_DIAMETER = 5;
const GRAZE_RANGE_MULTIPLIER = 25;
const PICKUP_MAGNET_DISTANCE = 60;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

//text files
let textFileStage1;
let dialogueFileStage1;

//the three numbers shown on side of gameplay screen in order from top to bottom
let powerScore = 0;
let grazeScore = 0;
let pointScore = 0;

//one at front is hidden to show zeroes ahead of actual number
//it would be better to do "00000" + score
let currentScore = 1000000000;
let score = 1000000000;

//how many seconds the game has been running for
let seconds = 0;
//how many seconds the stage has been running for, resets on stage start (number will not increase if below zero)
let stageSeconds = 0;

let backgroundScreenBuffer;

//classes for pickups that the player can touch to power up
//////////////////////////////////////////////////////////////////////////////////////////////
//temporary class

class StandardPlayerPickup {
  constructor(x,y,speed,radius,type) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = radius;
    this.type = type;
    this.originalSpeed = speed;
  }
  draw() {
    fill(255,0,255);
    noStroke();
    if (this.type !== 'none') {
      circle(this.x,this.y,this.radius*2);
    }
  }
  checkForCollision() {
    //for every pickup in pickupArray, check if the pickup is close enough for player to touch
    //all hitboxes are technically circles but it shouldn't matter because it's not very noticable
    if (dist(playerX,playerY,this.x,this.y) - this.radius <= PLAYER_HITBOX_DIAMETER/2) {
      //turn into useless invisible object untill offscreen, which will then be deleted
      this.type = 'none';
    }
  }
  move() {
    //pickups move down by default but will fly towards player under certain circumstances
    if (bringPickupsToPlayer || dist(playerX,playerY,this.x,this.y) < PICKUP_MAGNET_DISTANCE) {
      if (this.speed === this.originalSpeed) {
        this.speed = 55;
      }
      angleMode(DEGREES);
      //point towards player
      this.direction = atan2(playerY-this.y,playerX-this.x);
      this.x += this.speed/10 * Math.cos(this.direction * Math.PI / 180);
      this.y += this.speed/10 * Math.sin(this.direction * Math.PI / 180);
      this.speed += 1;
    }
    else {
      this.speed = this.originalSpeed;
      this.y += this.speed/10;
    }
  }

}

//////////////////////////////////////////////////////////////////////////////////////////////

//classes for hitboxes, each one has different behaviour but similar properties such as speed, size
//////////////////////////////////////////////////////////////////////////////////////////////
//default circle hitbox that moves straight at a set speed
class StandardCircularHitbox {
  constructor(x,y,direction,speed,radius,image,type,target) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.radius = radius;
    this.image = image;
    this.type = type;
    this.target = target;
    this.grazeRange = radius + GRAZE_RANGE_MULTIPLIER;
    this.canGraze = true;
  }
  draw() {
    fill(255,0,0,50);
    noStroke();
    circle(this.x,this.y,this.grazeRange);
    fill(255,0,0,100);
    noStroke();
    circle(this.x,this.y,this.radius);
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    //player hit inner hitbox causing them to take damage
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= PLAYER_HITBOX_DIAMETER/2) {
      console.log('true');
    }
    //player 'grazed' the outer hitbox causing a sound to play and make graze number only increase once as graze only triggers once per hitbox
    else if (dist(playerX,playerY,this.x,this.y) - this.grazeRange/2 <= PLAYER_HITBOX_DIAMETER/2) {
      if (this.canGraze) {
        this.canGraze = false;
        grazeScore++;
        console.log('graze');
      }
      grazeParticle();
    }
  }
  move() {
    //move in direction in degrees
    this.x += this.speed * Math.cos(this.direction * Math.PI / 180);
    this.y += this.speed * Math.sin(this.direction * Math.PI / 180);
  }
}

//classes for enemies, each one has different behaviour but use a set type for things like sprites
//////////////////////////////////////////////////////////////////////////////////////////////
class StandardEnemy {
  constructor(type,time,position,direction,speed) {
    this.type = type;
    this.time = time;
    this.pos = position;
    this.dir = direction;
    this.speed = speed;
  }
  draw() {
    fill(150, 255, 150,50);
    noStroke();
    circle(this.x,this.y,PLAYER_HITBOX_DIAMETER);
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    //player hit inner hitbox causing them to take damage (cannot graze enemy hitboxes)
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= PLAYER_HITBOX_DIAMETER/2) {
      console.log('touched enemy');
    }
  }
  move() {
    //move in direction in degrees
    this.x += this.speed * Math.cos(this.direction * Math.PI / 180);
    this.y += this.speed * Math.sin(this.direction * Math.PI / 180);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function preload() {
  textFileStage1 = loadStrings('/text/stage1.txt');
  //dialogueFileStage1 = loadStrings();
  //put in setup eventually and show loading screen while text/images/audio load
}

function setup() {
  testHitbox = new StandardCircularHitbox(300,300,360,0,15,0,0);
  testPickup = new StandardPlayerPickup(width/2,-100,15,8,'type');
  //testPickup2 = new StandardPlayerPickup(width/2-123,0,5,12,'type');

  hitboxArray.push(testHitbox);
  pickupArray.push(testPickup);
  //pickupArray.push(testPickup2);
  font = loadFont('/fonts/verdana.ttf');
  canvas = createCanvas(windowHeight/3*4, windowHeight, WEBGL);
  canvas.position((windowWidth-width)/2,0);
  frameRate(60);

  backgroundScreenBuffer = createFramebuffer();
  readStageInfo();
  //camera(width/2,height/2,800,0,0,0);
}

function checkInput() {
  if (keyIsPressed) {
    if (isPlayerMovable && state === 'game') {
      let playerMoveDirection = -1;
      //movement/shooting options for player if player is able to move
      if (keyIsDown(SHIFT)) {
        //slow down player movement if shift is held
        playerMoveSpeed = SHIFT_PLAYER_MOVESPEED;
      }
      else {
        playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;
      }

      if (keyIsDown(90)) {
        console.log('s');
        bringPickupsToPlayer = !bringPickupsToPlayer;
      }

      //arrow key movement
      if (keyIsDown(UP_ARROW) && !keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
        playerMoveDirection = 270;
      }
      else if (keyIsDown(DOWN_ARROW) && !keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
        playerMoveDirection = 90;
      }
      else if (keyIsDown(RIGHT_ARROW)) {
        playerMoveDirection = 0;
        if (keyIsDown(UP_ARROW)) {
          playerMoveDirection = 315;
        }
        else if (keyIsDown(DOWN_ARROW)) {
          playerMoveDirection = 45;
        }
      }
      else if (keyIsDown(LEFT_ARROW)) {
        playerMoveDirection = 180; 
        if (keyIsDown(UP_ARROW)) {
          playerMoveDirection = 225;
        }
        else if (keyIsDown(DOWN_ARROW)) {
          playerMoveDirection = 135;
        }
      }
      if (playerMoveDirection !== -1) {
        playerX += playerMoveSpeed * Math.cos(playerMoveDirection * Math.PI / 180);
        playerY += playerMoveSpeed * Math.sin(playerMoveDirection * Math.PI / 180);
      }  
    }
  }
}

function createHitbox(hitbox,x,y,direction,speed,radius,image,type,target) {
  let newHitbox;
  if (hitbox === 0) {
    newHitbox = new StandardCircularHitbox(x,y,direction,speed,radius,image,type,target);
  }
  if (hitboxArray.length >= MAX_HITBOX_COUNT || state !== 'game') {
    hitboxArray.shift();
  }
  hitboxArray.push(newHitbox);
}
function createPickup(pickup,x,y,speed,radius,type) {
  let newPickup;
  if (pickup === 0) {
    newPickup = new StandardPlayerPickup(x,y,speed,radius,type);
    pickupArray.push(newPickup);
  }
  if (pickupArray.length >= MAX_PICKUP_COUNT || state !== 'game') {
    pickupArray.shift();
  }
  pickupArray.push(newPickup);
}

function draw() {
  orbitControl();
  background(220);
  drawBackgroundBuffer();
  fill('deeppink');

  if (frameCount % 5 === 0) {
    //createPickup(0,random(-350,350),-450,5,8,'type');
  }

  textFont(font);
  textSize(20);
  stroke(0);
  noFill();
  rect(20,20,height-80);
  noStroke();
  text('qwertyuiop 1234567890', 0, 0);
  checkInput();

  checkFrameCount();
  runState();
  if (frameCount % 30 === 0) {
    createHitbox(0,0,0,0,0,8,0,0);
  }
}

function runState() {
  if (state === 'menu') {
    playTrack();
  }
  if (state === 'game') {
    updateObjects();
    drawPlayer();
    drawStage();
  }
}

function checkFrameCount() {
  //run this every second since game starts
  if (frameCount % 60 === 1) {
    seconds++;
    //reset at stage start
    if (stageSeconds >= 0) {
      stageSeconds++;
      spawnEnemiesEachSecond();
    }
    if (betweenStages) {
      //to ensure seconds count always starts at the same time, the game stalls until a second has passed
      betweenStages = false;
    }
  }

}

function updateObjects() {
  for (let hitbox of hitboxArray) {
    hitbox.move();
    hitbox.checkForCollision();
    if (drawHitboxes) {
      hitbox.draw();
    }
  }
  for (let pickup of pickupArray) {
    pickup.move();
    pickup.checkForCollision();
    if (drawHitboxes) {
      pickup.draw();
    }
  }
}

function playTrack(track) {

}

function grazeParticle() {

}

function drawPlayer() {
  if (drawHitboxes) {
    fill(255,0,0);
    circle(playerX,playerY,5);
  }
}

function drawStage() {

}

function readStageInfo() {
  let line = 0;
  if (stage > 0) {
    textFile = textFileStage1;
    for (let textLine of textFile) {
      line++;
      //check for comments
      if (textLine.substring(0,2) === "//") {
        textLine = '';
      }
      if (textLine.substring(0,5) === "stage:") {
        //read and set stage number
        textLine = textLine.slice(6);
        stage = int(textLine);
      }
      if (textLine === "newEnemy") {
        //create new enemy with info from text
        newEnemy(textFile[line+1].slice(-3), textFile[line+2].slice(-3), );
      }

    }
  }
}

function newEnemy(type,time,position,direction,speed) {
  //add time to spawn in enemy array, every second game will check if the array has the number equal to stage time,
  //and will spawn every enemy in that array
  currentStageEnemyArray.push(int(time));
  console.log(currentStageEnemyArray);
}

function spawnEnemiesEachSecond() {
  console.log(stageSeconds);
  for (let index of currentStageEnemyArray) {
    if (index === int(stageSeconds)) {
      console.log("found");
      for (let enemy of index) {
        //create enemies contained in index, index is a 'second' of time where enemies are set to spawn at this time
        let newEnemy = new StandardEnemy(type,time,position,direction,speed);
      }

    }
  }
}

function drawBackgroundBuffer() {
  backgroundScreenBuffer.begin();
  clear();
  fill(255);
  rect(0,0,500,500);
  torus(20);
  lights();
  backgroundScreenBuffer.end();
  //image(backgroundScreenBuffer, 0, 0, 500, 500);
}