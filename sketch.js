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
let testHitbox;

const MAX_HITBOX_COUNT = 1000;

let stage = 0;
let state = 'game';
let isPlayerMovable = true;

let spawnpos = 0;
let playerX = 0;
let playerY = 0;
const DEFAULT_PLAYER_MOVESPEED = 4;
const SHIFT_PLAYER_MOVESPEED = 2;
const PLAYER_HITBOX_DIAMETER = 5;
const GRAZE_RANGE_MULTIPLIER = 25;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

//the three numbers shown on side of gameplay screen in order from top to bottom
let powerScore = 0;
let grazeScore = 0;
let pointScore = 0;

//one at front is hidden to show zeroes ahead of actual number
//it would be better to do "00000" + score
let currentScore = 1000000000;
let score = 1000000000;

let backgroundScreenBuffer;

//classes for pickups that the player can touch to power up
//////////////////////////////////////////////////////////////////////////////////////////////
//temporary class

class StandardPlayerPickup {
  constructor(x,y,speed,type) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.type = type;
  }
  draw() {
    fill(255,0,0);
    noStroke();
    if (this.type !== 'none') {
      square(this.x,this.y,12);
    }
  }
  checkForCollision() {
    //for every pickup in pickupArray, check if the pickup is close enough for player to touch
    //all hitboxes are technically circles but it shouldn't matter because it's not very noticable
    if (dist(playerX,playerY,this.x,this.y) - 8 <= 5) {
      //turn into useless invisible object untill offscreen, which will then be deleted
      this.type = 'none';
    }
  }
  move() {
    //pickups can only move down
    this.y += this.speed/10;
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


//////////////////////////////////////////////////////////////////////////////////////////////

function setup() {
  testHitbox = new StandardCircularHitbox(300,300,360,0,15,0,0);
  testPickup = new StandardPlayerPickup(width/2,0,5,'type');

  hitboxArray.push(testHitbox);
  pickupArray.push(testPickup);
  font = loadFont('/fonts/verdana.ttf');
  canvas = createCanvas(windowHeight/3*4, windowHeight, WEBGL);
  canvas.position((windowWidth-width)/2,0);
  frameRate(60);

  backgroundScreenBuffer = createFramebuffer();
  //camera(width/2,height/2,800,0,0,0);
}

function checkInput() {
  if (keyIsPressed) {
    if (isPlayerMovable) {
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
  if (hitboxArray.length >= MAX_HITBOX_COUNT) {
    hitboxArray.shift();
  }
  hitboxArray.push(newHitbox);
}

function draw() {
  orbitControl();
  background(220);
  drawBackgroundBuffer();
  fill('deeppink');
  textFont(font);
  textSize(20);
  stroke(0);
  noFill();
  rect(20,20,height-80);
  noStroke();
  text('qwertyuiop 1234567890', 0, 0);
  checkInput();
  // if (frameCount % 30 === 0) {
  //   spawnpos += 20;
  //   testHitbox = new StandardCircularHitbox(spawnpos,0,90,3,20,0,0);
  //   hitboxArray.push(testHitbox);
  //   testHitbox = new StandardCircularHitbox(spawnpos + 120,-60,90,2,20,0,0);
  //   hitboxArray.push(testHitbox);
  //   testHitbox = new StandardCircularHitbox(spawnpos + 240,-120,90,4,20,0,0);
  //   hitboxArray.push(testHitbox);
  //   if (spawnpos > width) {
  //     spawnpos = 0;
  //   }
  // }
  if (state === 'game') {
    updateObjects();
    drawPlayer();
  }
  if (frameCount % 30 === 0) {
    createHitbox(0,0,0,0,0,8,0,0);
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

function grazeParticle() {
}

function drawPlayer() {
  if (drawHitboxes) {
    circle(playerX,playerY,5);
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