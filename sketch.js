// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let drawPictures = true;
let drawHitboxes = true;
let drawBackground = true;
let drawGrazeHitboxes = false;

let backgroundImage;
let gradientImage;
let powerImage;
let hudImage;

let canvas;
let font;

let hitboxArray = [];
let pickupArray = [];
let enemyArray = [];
let playerBulletArray = [];
let currentStageEnemyArray = [];
let testHitbox;

const MAX_HITBOX_COUNT = 200;
const MAX_PICKUP_COUNT = 200;
const MAX_PLAYER_BULLET_COUNT = 100;

let stage = 1;
let state = 'game';
let betweenStages = false;
let isPlayerMovable = true;

let spawnpos = 0;
let playerX = 0;
let playerY = 0;
let bringPickupsToPlayer = false;

let gameBoundMin;
let gameBoundMax;

let defaultCamera;

const DEFAULT_PLAYER_MOVESPEED = 4;
const SHIFT_PLAYER_MOVESPEED = 2;
const PLAYER_HITBOX_DIAMETER = 15;
const PLAYER_BULLET_SIZE = 5;
const ENEMY_SIZE = 25;
const GRAZE_RANGE_MULTIPLIER = 50;
const PICKUP_MAGNET_DISTANCE = 60;
const AUTO_PICK_UP_PICKUPS_HEIGHT = -110;
//used every second
const PICKUP_SPAWN_CHANCE = 2;
let playerMoveSpeed = DEFAULT_PLAYER_MOVESPEED;

//text files
let textFileStage1;
let dialogueFileStage1;

let pickupParticleSize = 0;

//the three numbers shown on side of gameplay screen in order from top to bottom
let powerScore = 0;
let grazeScore = 0;
let pointScore = 0;

let shootingCooldown = 0;
//if bullet spawns on left or right
let firingFlipflop = 1;

//one at front is hidden to show zeroes ahead of actual number
//it would be better to do "00000" + score
let currentScore = 1000000000;
let score = 1000000000;

//how many seconds the game has been running for
let seconds = 0;
//how many seconds the stage has been running for, resets on stage start (number will not increase if below zero)
let stageSeconds = 0;

//different motions for the animated background
let backgroundMode = 1;
let backgroundTimer = 0;
let bgX = 0;
let bgY = 0;
let bgZ = 500;

const TOTAL_BACKGROUNDS = 4;

let backgroundScreenBuffer;
let backgroundScreenBuffer2;

//classes for pickups that the player can touch to power up
//////////////////////////////////////////////////////////////////////////////////////////////

class StandardPlayerPickup {
  constructor(x,y,speed,radius,type,sendToPlayer) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = radius;
    this.type = type;
    this.sendToPlayer = sendToPlayer;
    this.originalSpeed = speed;
  }
  draw() {
    fill(255,0,255);
    noStroke();
    if (this.type === 'power') {
      square(this.x,this.y,this.radius*2);
      fill(255);
      textFont(font);
      textSize(this.radius*2.5);
      noStroke();
      text('P', this.x+1,this.y+this.radius*1.9);
      //image(powerImage,this.x,this.y,this.radius*2,this.radius*2);
    }
  }
  checkForCollision() {
    //for every pickup in pickupArray, check if the pickup is close enough for player to touch
    //all hitboxes are technically circles but it shouldn't matter because it's not very noticable
    if (dist(playerX,playerY,this.x,this.y) - this.radius <= PLAYER_HITBOX_DIAMETER/2 && this.type !== 'none') {
      //turn into useless invisible object untill offscreen, which will then be deleted
      if (this.type === 'power') {
        powerScore++;
        score += powerScore + 1;
      }
      else if (this.type === 'power2') {
        powerScore += 10;
      }
      pickupParticle();
      this.type = 'none';
    }
  }
  move() {
    //pickups move down by default but will fly towards player under certain circumstances
    if (this.sendToPlayer && bringPickupsToPlayer || dist(playerX,playerY,this.x,this.y) < PICKUP_MAGNET_DISTANCE) {
      if (this.speed === this.originalSpeed) {
        this.speed = 55;
      }
      //point towards player
      this.direction = atan2(playerY-this.y,playerX-this.x);
      this.x += this.speed/10 * Math.cos(this.direction * Math.PI / 180);
      this.y += this.speed/10 * Math.sin(this.direction * Math.PI / 180);
      this.speed += 1;
    }
    else if (this.type !== 'none') {
      this.speed = this.originalSpeed;
      this.y += this.speed/10;
    }
    if (this.y > 400) {
      this.type = 'none';
    }
  }

}

//////////////////////////////////////////////////////////////////////////////////////////////

//classes for hitboxes, each one has different behaviour but similar properties such as speed, size
//////////////////////////////////////////////////////////////////////////////////////////////
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
    if (drawGrazeHitboxes) {
      fill(255,0,0,50);
      noStroke();
      circle(this.x,this.y,this.grazeRange);
    }
    fill(255,0,0,200);
    noStroke();
    circle(this.x,this.y,this.radius);
    fill(255);
    noStroke();
    circle(this.x,this.y,this.radius*0.6);
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    //player hit inner hitbox causing them to take damage
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= PLAYER_HITBOX_DIAMETER/2) {
      console.log('player hit');
      this.radius = 0.1;
    }
    //player 'grazed' the outer hitbox causing a sound to play and make graze number only increase once as graze only triggers once per hitbox
    else if (dist(playerX,playerY,this.x,this.y) - this.grazeRange/2 <= PLAYER_HITBOX_DIAMETER/2) {
      if (this.canGraze) {
        this.canGraze = false;
        this.grazeRange = 0.1;
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

//class for enemies, green circles
//////////////////////////////////////////////////////////////////////////////////////////////
class StandardEnemy {
  constructor(type,time,x,y,direction,speed,interval,delay,lifetime,originDir) {
    this.type = type;
    this.time = time;
    this.x = x;
    this.y = y;
    this.dir = direction;
    this.speed = speed;
    this.interval = interval;
    this.delay = delay;
    this.lifetime = lifetime;
    this.originDir = originDir;
    this.defaultDirection = direction;
    this.defaultX = x;
    this.timeAlive = 0;
    this.framesAlive = 0;
    this.isAlive = true;
  }
  draw() {
    if (this.isAlive) {
      fill(100, 200, 100);
      noStroke();
      circle(this.x,this.y,ENEMY_SIZE);
    }
  }
  checkForCollision() {
    for (let bullet of playerBulletArray) {
      if (dist(bullet.x,bullet.y,this.x,this.y) - ENEMY_SIZE/2 <= PLAYER_BULLET_SIZE/2 && this.isAlive && bullet.canHit) {
        this.isAlive = false;
        score += 250;
      } 
    }
  }
  move() {
    if (this.framesAlive >= this.interval && this.isAlive && this.x > gameBoundMax || this.x < gameBoundMin || this.y > 400) {
      //delete enemy when out of bounds
      if (this.x > gameBoundMax && this.defaultX < 0) {
        console.log(this.framesAlive,this.interval);
        this.isAlive = false;
      }
      else if (this.x < gameBoundMin && this.defaultX >= 0) {
        console.log(this.framesAlive,this.interval);
        this.isAlive = false;
      }
    }
    this.framesAlive++;
    if (this.framesAlive >= this.interval && this.framesAlive < this.lifetime) {
      this.dir += this.defaultDirection;
    }
    else if (this.framesAlive >= this.lifetime) {
      
    }
    else {
      //move down until interval is reached then start movement pattern
      this.dir = this.originDir;
    }
    this.x += this.speed * Math.cos(this.dir * Math.PI / 180);
    this.y += this.speed * Math.sin(this.dir * Math.PI / 180);
  }
  checkForAttack() {
    this.timeAlive++;
    if (this.timeAlive % this.delay === 0 && this.isAlive && this.framesAlive >= this.interval) {
      enemyAttackFromType(int(this.type),this.x,this.y,this.dir,this.speed);
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

//player-fired bullet class
//////////////////////////////////////////////////////////////////////////////////////////////
class PlayerBullet {
  constructor(x,y,direction,speed) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.canHit = true;
  }
  draw() {
    if (this.canHit) {
      fill(255,0,0);
      noStroke();
      circle(this.x,this.y,PLAYER_BULLET_SIZE);
    }
  }
  checkForCollision() {
    //for every hitbox in hitboxArray, check if the hitbox from array is able to hit this (if type = target) and if touching hitbox
    //player hit inner hitbox causing them to take damage (cannot graze enemy hitboxes)
    if (dist(playerX,playerY,this.x,this.y) - this.radius/2 <= PLAYER_BULLET_SIZE/2) {
      console.log('touched enemy');
    }
  }
  move() {
    //move in direction in degrees
    //this.direction = atan2(playerY-this.y,playerX-this.x);
    this.x += this.speed/10 * Math.cos(this.direction * Math.PI / 180);
    this.y += this.speed/10 * Math.sin(this.direction * Math.PI / 180);
    if (this.y < -380) {
      this.canHit = false;
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////

function preload() {
  textFileStage1 = loadStrings('/text/stage1.txt');
  hudImage = loadImage('images/hud.png');
  backgroundImage = loadImage('images/background.png');
  gradientImage = loadImage('images/gradient1.png');
  powerImage = loadImage('images/power.png');

  //dialogueFileStage1 = loadStrings();
  //put in setup eventually and show loading screen while text/images/audio load
}

function setup() {
  testHitbox = new StandardCircularHitbox(300,300,360,0,15,0,0);
  testPickup = new StandardPlayerPickup(width/2,-100,15,8,'power');
  hitboxArray.push(testHitbox);
  pickupArray.push(testPickup);
  //pickupArray.push(testPickup2);
  font = loadFont('/fonts/verdana.ttf');
  canvas = createCanvas(windowHeight/3*4, windowHeight, WEBGL);
  //canvas = createCanvas(400, 300, WEBGL);
  defaultCamera = createCamera();
  canvas.position((windowWidth-width)/2,0);
  frameRate(60);
  imageMode(CENTER);
  angleMode(DEGREES);

  backgroundScreenBuffer = createFramebuffer();
  backgroundScreenBuffer2 = createFramebuffer();
  readStageInfo();

  gameBoundMin = width/10-height/1.4;
  gameBoundMax = width/10;
}

function draw() {
  orbitControl();
  background(50);
  //runAnimatedBackground();
  if (frameCount % 2 === 0 && drawBackground) {
    drawBackgroundBuffer();
    drawBackgroundBuffer2();
  }
  imageMode(CENTER);
  image(backgroundScreenBuffer2, -width/6,0,height/1.4,height-round(height*0.1666666));
  // image(backgroundScreenBuffer2, -width/4,0,height/2,height-round(height*0.1666666));
  //texture(backgroundScreenBuffer);
  //rect(0,0,400,300);
  image(backgroundScreenBuffer,-width/6,0);
  imageMode(CENTER);

  if (pickupParticleSize > 0) {
    pickupParticle();
  }
  checkInput();

  checkFrameCount();
  runState();
  shootingCooldown--;

  //if player power is maxed, and player is at top of screen, send all pickups towards them
  if (playerY <= AUTO_PICK_UP_PICKUPS_HEIGHT && powerScore >= 0) {
    bringPickupsToPlayer = true;
  }
  else {
    bringPickupsToPlayer = false;
  }
  image(hudImage,0,0,width,height);
  circle(gameBoundMin,0,5);
  circle(gameBoundMax,0,5);
  fill('deeppink');
  textFont(font);
  textSize(26);
  noStroke();
  text(str(score).slice(1), width/4.5, -height/2.98);
  fill('deeppink');
  textFont(font);
  textSize(20);
  noStroke();
  //text(str(score).slice(1), -300, 350);
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
        playerFireBullet();
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

function enemyAttackFromType(type,x,y,dir,speed) {
  //hardcoded attack patterns go here
  if (type === 1) {
    createHitbox(0,x,y,0,3,20);
    createHitbox(0,x,y,72,3,20);
    createHitbox(0,x,y,144,3,20);
    createHitbox(0,x,y,216,3,20);
    createHitbox(0,x,y,288,3,20);
  }
  if (type === 2) {
    createHitbox(0,x,y,90,3,20);
  }
}

function playerFireBullet() {
  if (shootingCooldown <= 0) {
    //0-19
    if (powerScore < 20) {
      //first level of power
      shootingCooldown = 10;
      createPlayerBullet(playerX,playerY,-90,60);
    }
    //20-39
    else if (powerScore < 40) {
      //second level of power
      shootingCooldown = 12;
      createPlayerBullet(playerX,playerY,-90,70);
      if (firingFlipflop === 0) {
        firingFlipflop = 1;
        createPlayerBullet(playerX-10,playerY,-45,55);
      }
      else if (firingFlipflop === 1) {
        firingFlipflop = 0;
        createPlayerBullet(playerX+10,playerY,-135,55);
      }
    }
  }
}

function createPlayerBullet(x,y,direction,speed) {
  if (playerBulletArray.length >= MAX_PLAYER_BULLET_COUNT || state !== 'game') {
    playerBulletArray.shift();
  }
  let bullet = new PlayerBullet(x,y,direction,speed);
  playerBulletArray.push(bullet);
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
function createPickup(pickup,x,y,speed,radius,type,sendToPlayer) {
  let newPickup;
  if (pickup === 0) {
    newPickup = new StandardPlayerPickup(x,y,speed,radius,type,sendToPlayer);
    pickupArray.push(newPickup);
  }
  if (pickupArray.length >= MAX_PICKUP_COUNT || state !== 'game') {
    pickupArray.shift();
  }
  pickupArray.push(newPickup);
}

function runState() {
  if (state === 'menu') {
    playTrack();
  }
  if (state === 'game') {
    updateObjects();
    drawPlayer();
    drawStage();
    showStatNumbers();
  }
}

function checkFrameCount() {
  //run this every second since game starts
  if (frameCount % 60 === 1) {
    seconds++;
    backgroundTimer++;
    //reset at stage start
    if (stageSeconds >= 0) {
      stageSeconds++;
      spawnRandomPowerPickups();
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
    //lazy
    if (true) {
      pickup.move();
      pickup.checkForCollision();
    }
    if (drawHitboxes) {
      pickup.draw();
    }
  }
  for (let enemy of enemyArray) {
    enemy.move();
    enemy.checkForCollision();
    enemy.checkForAttack();
    if (drawHitboxes) {
      enemy.draw();
    }
  }
  for (let bullet of playerBulletArray) {
    bullet.move();
    bullet.checkForCollision();
    if (drawHitboxes) {
      bullet.draw();
    }
  }
}

function playTrack(track) {

}

function grazeParticle() {

}

function pickupParticle() {
  pickupParticleSize += 15;
  fill(255,0,255,100);
  circle(playerX,playerY,pickupParticleSize/2);
  if (pickupParticleSize >= 80) {
    pickupParticleSize = 0;
  }
  else if (pickupParticleSize <= 30) {
    pickupParticleSize = 30;
  }
}

function drawPlayer() {
  if (drawHitboxes) {
    fill(255,0,0);
    circle(playerX,playerY,PLAYER_HITBOX_DIAMETER);
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
        newEnemy(textFile[line].slice(-3),textFile[line+1].slice(-3),textFile[line+2].slice(-4),textFile[line+3].slice(-4),textFile[line+4].slice(-3),textFile[line+5].slice(-3),textFile[line+6].slice(-3),textFile[line+7].slice(-3),textFile[line+8].slice(-3),textFile[line+9].slice(-3));
      }
    }
  }
}

function showStatNumbers() {

}

function newEnemy(type,time,x,y,direction,speed,interval,delayBetweenAttacks,lifetime,origindir) {
  //add time to spawn in enemy array, every second game will check if the array has the number equal to stage time,
  //and will spawn every enemy in that array
  //console.log(speed);
  time = int(time);
  currentStageEnemyArray.push(time);
  //info of enemy
  let enemyInfo = {
    type: int(type),
    time: int(time),
    x: int(x),
    y: int(y),
    direction: int(direction),
    speed: int(speed),
    interval: int(interval),
    delay: int(delayBetweenAttacks),
    lifetime: int(lifetime),
    origindir: int(origindir),
  };
  if (currentStageEnemyArray.includes(time)) {
    //put enemy in time slot in array
    currentStageEnemyArray.push(enemyInfo);
  }
}

function spawnEnemiesEachSecond() {
  if (currentStageEnemyArray.includes(stageSeconds)) {
    for (let enemy of currentStageEnemyArray) {
      if (enemy.time === stageSeconds) {
        //if enemy exists to spawn in this time
        //(type,time,position,direction,speed)
        // console.log(enemy.type, enemy.time, enemy.x, enemy.y, enemy.direction, enemy.speed);
        let newEnemyToSpawn = new StandardEnemy(enemy.type, enemy.time, enemy.x, enemy.y, enemy.direction, enemy.speed, enemy.interval, enemy.delay, enemy.lifetime, enemy.origindir);
        enemyArray.push(newEnemyToSpawn);
      }
    }
  }
}

function drawBackgroundBuffer() {
  //window for drawing 3D background
  backgroundScreenBuffer.begin();
  backgroundScreenBuffer.resize(1000,1000);
  fill(0,0,0,255);
  if (backgroundMode === 1) {
    bgZ = 400;
    clear();
    //if (backgroundTimer >= 12) {
    //  clear();
    //  changeBackground();
    //}
    //else {
    translate(bgX,bgY,bgZ);
    texture(backgroundImage);
    rotateX(degrees(frameCount * 0.01));
    rotateY(degrees(frameCount * 0.01));
    rotateZ(degrees(frameCount * 0.01));
    //}
  }
  else if (backgroundMode === 2) {
    if (backgroundTimer >= 12) {
      clear();
      changeBackground();
    }
    else {
      bgZ = 300;
      translate(bgX,bgY,bgZ);
      translate(bgX+random(-200,200),bgY+random(-200,200),bgZ);
      if (round(random(0,100)) === 5) {
        clear();
      }
      texture(backgroundImage);
      rotateX(degrees(frameCount * random(1,359)));
      rotateY(degrees(frameCount * random(1,359)));
      rotateZ(degrees(frameCount * random(1,359)));
    }
  }
  else if (backgroundMode === 3) {
    clear();
    if (backgroundTimer >= 12) {
      changeBackground();
    }
    else {
      bgZ = 800;
      bgX += 8;
      translate(bgX,bgY,bgZ);
      if (bgX > 300) {
        bgX = -300;
      }
      if (round(random(0,100)) === 5) {
        clear();
      }
      texture(backgroundImage);
    }
  }
  //ensure the background cannot be any of the ones below (except for this one) since it is meant to follow the pattern shown
  else if (backgroundMode === TOTAL_BACKGROUNDS) {
    bgZ = 300;
    if (backgroundTimer >= 3) {
      clear();
      backgroundTimer = 0;
      backgroundMode++;
    }
    else {
      translate(bgX,bgY,bgZ);
      texture(backgroundImage);
      rotateY(degrees(frameCount * 15));
    }
  }
  else if (backgroundMode === TOTAL_BACKGROUNDS + 1) {
    bgZ = 350;
    if (backgroundTimer >= 3) {
      clear();
      backgroundTimer = 0;
      backgroundMode++;
    }
    else {
      translate(bgX,bgY,bgZ);
      texture(backgroundImage);
      rotateX(degrees(frameCount * -15));
    }
  }
  else if (backgroundMode === TOTAL_BACKGROUNDS + 2) {
    bgZ = 400;
    if (backgroundTimer >= 3) {
      clear();
      backgroundTimer = 0;
      backgroundMode++;
    }
    else {
      translate(bgX,bgY,bgZ);
      texture(backgroundImage);
      rotateY(degrees(frameCount * -15));
    }
  }
  else if (backgroundMode === TOTAL_BACKGROUNDS + 3) {
    bgZ = 430;
    if (backgroundTimer >= 3) {
      clear();
      changeBackground();
    }
    else {
      translate(bgX,bgY,bgZ);
      texture(backgroundImage);
      rotateX(degrees(frameCount * 15));
    }
  }
  else {
    fill(0,0,0,255);
  }
  box(200);
  resetMatrix();
  backgroundScreenBuffer.end();
  //image(backgroundScreenBuffer, 0, 0, 500, 500);
}

function drawBackgroundBuffer2() {
  if (stage === 1) {
    backgroundScreenBuffer2.begin();
    image(gradientImage,0,0,windowWidth,windowHeight);
    backgroundScreenBuffer2.end();
  }
}

function changeBackground() {
  let previousBackground = backgroundMode;
  backgroundTimer = 0;
  bgX, bgY, bgX = 0;
  backgroundMode = round(random(1,TOTAL_BACKGROUNDS));
  //smart solution
  if (backgroundMode === previousBackground) {
    changeBackground();
  }
  if (backgroundMode === 3) {
    bgX = -300;
  }
}

function spawnRandomPowerPickups() {
  //chance every second to spawn small power pickup at top of screen
  if (round(random(0,PICKUP_SPAWN_CHANCE)) === round(PICKUP_SPAWN_CHANCE/2)) {
    //rarer chance for large pickup
    if (round(random(0,PICKUP_SPAWN_CHANCE*4)) === round(PICKUP_SPAWN_CHANCE/2)) {
      //createPickup(0,random(-400,400),-400,10,15,'power2',false);
    }
    else {
      createPickup(0,random(gameBoundMin,gameBoundMax),-400,10,8,'power',false);
    }
  }
}