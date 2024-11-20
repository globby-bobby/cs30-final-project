// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let canvas;

let hitboxArray = [];

let playerX = 200;
let playerY = 200;
const DEFAULT_PLAYER_MOVESPEED = 3;
const SHIFT_PLAYER_MOVESPEED = 1;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

//htibox class 
class Hitbox {
  constructor(x1,y1,x2,y2,type) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.type = type;
  }
  draw() {
    fill(255,0,0,100);
    noStroke();
    square(this.x1,this.y1,25);
  }
}

function setup() {
  canvas = createCanvas(windowHeight/3*4, windowHeight);
  //shake left and right when bomb's explosion 'ticks'
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
  checkInput();
  square(playerX,playerY,5);
  // if (frameCount % 30 === 0) {
  //   let x1 = random(0,width);
  //   let y1 = random(0,height);
  //   let hitbox = new Hitbox(x1,y1,x1+0.1,y1+1,'none');
  //   hitboxArray.push(hitbox);
  // }
  // for (let item of hitboxArray) {
  //   item.draw();
  // }
}
