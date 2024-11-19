// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let hitboxArray = [];

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
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  if (frameCount % 30 === 0) {
    let x1 = random(0,width);
    let y1 = random(0,height);
    let hitbox = new Hitbox(x1,y1,x1+0.1,y1+1,'none');
    hitboxArray.push(hitbox);
  }
  for (let item of hitboxArray) {
    item.draw();
  }
}
