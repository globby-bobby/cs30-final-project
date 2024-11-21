// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let canvas;
let font;

let hitboxArray = [];
let testHitbox;

let playerX = 200;
let playerY = 200;
const DEFAULT_PLAYER_MOVESPEED = 3;
const SHIFT_PLAYER_MOVESPEED = 1;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

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
  }
  draw() {
    fill(255,0,0,100);
    noStroke();
    circle(this.x,this.y,25);
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    for (let hitbox of hitboxArray) {
      if (hitbox.type === this.target) {
        console.log('true');
      }
    }
  }
  move() {
    //
    this.x += this.speed * Math.cos(this.direction * Math.PI / 180);
    this.y += this.speed * Math.sin(this.direction * Math.PI / 180);
    this.direction += 2;
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////

function setup() {
  testHitbox = new StandardCircularHitbox(300,300,360,5,0,0,0);
  hitboxArray.push(testHitbox);
  font = loadFont('/fonts/verdana.ttf');
  canvas = createCanvas(windowHeight/3*4, windowHeight);
  canvas.position((windowWidth-width)/2,0);
  frameRate(60);
}

function checkInput() {
  if (keyIsPressed) {
    //slow down player movement if shift is held
    if (keyIsDown(SHIFT)) {
      playerMoveSpeed = SHIFT_PLAYER_MOVESPEED;
    }
    else {
      playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;
    }
    //move player with arrow keys
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

function draw() {
  background(220);
  fill(220);
  rect(40,20,width/2+100,height-40);
  fill('deeppink');
  textFont(font);
  textSize(20);
  text('qwertyuiop 1234567890', width/2+150, 40);
  checkInput();
  square(playerX,playerY,5);
  for (let hitbox of hitboxArray) {
    console.log('hitbox');
    hitbox.move();
    hitbox.draw();
  }
  // if (frameCount % 120) {
  //   let testHitbox = new StandardCircularHitbox(random(100,400),360,5,0,0,0);
  //   hitboxArray.push(testHitbox);
  // }
}
