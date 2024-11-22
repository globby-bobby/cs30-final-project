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

let spawnpos = 0;
let playerX = 200;
let playerY = 200;
const DEFAULT_PLAYER_MOVESPEED = 3;
const SHIFT_PLAYER_MOVESPEED = 1.5;
const GRAZE_RANGE_MULTIPLIER = 2;
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
    this.grazeRange = radius * GRAZE_RANGE_MULTIPLIER;
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
    //console.log(dist(playerX,playerY,this.x,this.y) - this.radius/2);
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= 7) {
      console.log('true');
    }
    else if (dist(playerX,playerY,this.x,this.y) - this.grazeRange/2 <= 10) {
      console.log('graze');
    }
  }
  move() {
    this.x += this.speed * Math.cos(this.direction * Math.PI / 180);
    this.y += this.speed * Math.sin(this.direction * Math.PI / 180);
    //this.direction += 5;
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////

function setup() {
  testHitbox = new StandardCircularHitbox(300,300,360,0,25,0,0);
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
  for (let hitbox of hitboxArray) {
    hitbox.move();
    hitbox.checkForCollision();
    hitbox.draw();
  }
  // if (frameCount % 120) {
  //   let testHitbox = new StandardCircularHitbox(random(100,400),360,5,0,0,0);
  //   hitboxArray.push(testHitbox);
  // }
}
