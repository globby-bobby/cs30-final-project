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
const DEFAULT_PLAYER_MOVESPEED = 3;
const SHIFT_PLAYER_MOVESPEED = 1.5;
const GRAZE_RANGE_MULTIPLIER = 25;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

//one at front is hidden to show zeroes ahead of actual number
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
//default circle hitbox (hitbox, not image) that moves straight at a set speed
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
  }
  draw() {
    //fill(255,0,0,50);
    noStroke();
    //circle(this.x,this.y,this.grazeRange);
    fill(255,0,0,100);
    noStroke();
    circle(this.x,this.y,this.radius);
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    //player hit inner hitbox causing them to take damage
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= 5) {
      console.log('true');
    }
    //player 'grazed' the outer hitbox causing a sound to play and make hitbox untouchable as graze only happens once per hitbox
    else if (dist(playerX,playerY,this.x,this.y) - this.grazeRange/2 <= 5 && this.grazeRange !== 0) {
      this.grazeRange = 0;
      //console.log('graze');
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
      //movement/shooting options for player if player is able to move
      if (keyIsDown(SHIFT)) {
        //slow down player movement if shift is held
        playerMoveSpeed = SHIFT_PLAYER_MOVESPEED;
      }
      else {
        playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;
      }
      //arrow key movement
      if (keyIsDown(RIGHT_ARROW)) {
        playerX += playerMoveSpeed;
      };
      if (keyIsDown(LEFT_ARROW)) {
        playerX -= playerMoveSpeed;
      };
      if (keyIsDown(UP_ARROW)) {
        playerY -= playerMoveSpeed;
      };
      if (keyIsDown(DOWN_ARROW)) {
        playerY += playerMoveSpeed;
      };
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
  text('qwertyuiop 1234567890', width/2+150, 40);
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
  if (frameCount % 1 === 0) {
    createHitbox(0,0,0,random(-360,360),1,15,0,0);
    createHitbox(0,0,0,random(-360,360),1,15,0,0);
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

function drawPlayer() {
  if (drawHitboxes) {
    square(playerX,playerY,5);
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