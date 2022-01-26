//-----To Do--------------------------------------------------------

//-----Global Variables--------------------------------------------------------

//Canvas Variables
let canvasSize = 400;
let fps = 60;

//Button Variables
let mouseMode = "selectSquare";

let insertButton;
let deleteButton;
let selectSquareButton;
let selectCircleButton;
let drawButton;
let eraseButton;

let m_start; 
let m_end;
let c_rad;
let selectColor;

//Point Variables
let n_points = 1;//canvasSize/10;
let qPoints;

//-----Main Functions--------------------------------------------------------

function setup() {

  createCanvas(canvasSize, canvasSize);
  frameRate(fps);
  noFill();
  strokeWeight(2);

  createButtons();
  
  m_start = createVector(width/2 - width/3, height/2 - height/3);
  m_end = createVector(width/2 + width/3, height/2 + height/3);
  c_rad = 50;
  qPoints = [];
  selectColor = color(255, 0, 255);
  
  Board = new QuadTree(createVector(floor(canvasSize/2), floor(canvasSize/2)), floor(canvasSize/2), 0, 16);
  
  for(let i = 0; i < n_points; i++){
    let testDot = genData(50, 50);//genData(random(width), random(height));
    Board.insert(testDot.position, testDot);
  }
  
  background(200);
  Board.displayData();
  
}

function draw() {
  
  background(200);
  
  updateBoard();
  Board.displayData();
  
  runMouseMode();
  showFPS();
  
}



//-----Mouse Functions--------------------------------------------------------

function boundMouse(){
  
  x = (mouseX < 0 ? 0 : mouseX);
  x = (mouseX > width ? width : mouseX);
  y = (mouseY < 0 ? 0 : mouseY);
  y = (mouseY > height ? height : mouseY);
  
  return createVector(x, y);
  
}

function runMouseMode(){
  
  noFill();  
  selectColor.setAlpha(255);
  stroke(selectColor);
  selectColor.setAlpha(10);
  fill(selectColor);
  
  if(mouseMode == 'selectSquare'){
    qPoints.forEach(qp =>{
      
      circle(qp.position.x, qp.position.y, qp.radius*2);

    })

    rect(m_start.x, m_start.y, m_end.x - m_start.x, m_end.y - m_start.y);
  }
  else if(mouseMode == 'selectCircle'){
    qPoints.forEach(qp =>{

      selectColor.setAlpha(255);
      stroke(selectColor);
      selectColor.setAlpha(10);
      fill(selectColor);
      circle(qp.position.x, qp.position.y, qp.radius*2);

    })

    selectColor.setAlpha(255);
    stroke(selectColor);
    selectColor.setAlpha(10);
    fill(selectColor);
    circle(mouseX, mouseY, c_rad*2);
  }
  else if(mouseMode == 'draw'){
    
    selectColor.setAlpha(255);
    stroke(selectColor);
    selectColor.setAlpha(10);
    fill(selectColor);
    rect(mouseX-25, mouseY-25, 50, 50);
  }
  else if(mouseMode == 'erase'){
    
    selectColor.setAlpha(255);
    stroke(selectColor);
    selectColor.setAlpha(10);
    fill(selectColor);
    rect(mouseX-25, mouseY-25, 50, 50);
    
  }
}

function mousePressed(){ 
  if(mouseMode == 'selectSquare'){
    qPoints = [];
    if(mouseX >=0 && mouseY >= 0 && mouseX <= width && mouseY <= height){
      m_start = boundMouse();
    }
  }
  else if(mouseMode == 'selectCircle'){
    qPoints = Board.queryRangeCirc(createVector(mouseX, mouseY), c_rad);
  }
  else if(mouseMode == 'draw'){
    
    //generate point
    x = random(mouseX - 25, mouseX + 25);
    y = random(mouseY - 25, mouseY + 25);
    //if inside bounds
    if(x >= 0 && y >= 0 && x <= width && y <= height){
      
      let p = genData(x, y);
      Board.insert(p.position, p);
      
    } 
  }
  else if(mouseMode == 'erase'){
    
    let del = Board.queryRangeRect(createVector(mouseX-25, mouseY-25), createVector(mouseX+25, mouseY+25))
    del.forEach(p => {Board.delete(p.position);})
    
  }
}

function mouseDragged(){
  if( mouseMode == 'selectSquare'){
    m_end = boundMouse();
  }
  else if(mouseMode == 'selectCircle'){
    qPoints = Board.queryRangeCirc(createVector(mouseX, mouseY), c_rad);
  }
  else if(mouseMode == 'draw'){
    
    //generate point
    x = random(mouseX - 25, mouseX + 25);
    y = random(mouseY - 25, mouseY + 25);
    //if inside bounds
    if(x >= 0 && y >= 0 && x <= width && y <= height){
      
      let p = genData(x, y);
      Board.insert(p.position, p);
      
    } 
  }
  else if(mouseMode == 'erase'){
    
    let del = Board.queryRangeRect(createVector(mouseX-25, mouseY-25), createVector(mouseX+25, mouseY+25))
    del.forEach(p => {Board.delete(p.position);})
    
  }
}

function mouseReleased(){

  if(m_start.x > m_end.x){

    let temp = m_end.x;
    m_end.x = m_start.x;
    m_start.x = temp;

  }

  if(m_start.y > m_end.y){

    let temp = m_end.y;
    m_end.y = m_start.y;
    m_start.y = temp;

  }

  if(mouseMode == 'selectCircle'){
    qPoints = Board.queryRangeCirc(m_start, m_end);
  }
  if(mouseMode == 'selectSquare'){
    qPoints = Board.queryRangeRect(m_start, m_end);
  }
  //console.log("Highlighted Points:", qPoints.length);
  
}

//-----Extra Functions--------------------------------------------------------

function createButtons(){
  insertButton = createButton("Insert");
  insertButton.mousePressed(function(){
    
    for(let i = 0; i < canvasSize; i++){
      p = genData(random(m_start.x, m_end.x), random(m_start.y, m_end.y));
      
      Board.insert(p.position, p);
      qPoints.push(p);
      stroke(255,255,0);
      circle(p.position.x, p.position.y, p.radius*2);
    }
  });
  
  deleteButton = createButton("Delete");
  deleteButton.mousePressed(function(){
    
    qPoints.forEach(qp =>{Board.delete(qp.position);})
    qPoints = [];
    
  });
  
  selectSquareButton = createButton("Select[]");
  selectSquareButton.mousePressed(function(){
    
    mouseMode = "selectSquare";
    qPoints = [];
    
  });
  selectCircleButton = createButton("SelectO");
  selectCircleButton.mousePressed(function(){
    
    mouseMode = "selectCircle";
    qPoints = [];
    
  });
  
  drawButton = createButton("Draw");
  drawButton.mousePressed(function(){
    
    mouseMode = "draw";
    qPoints = [];
    
  });
  
  eraseButton = createButton("Erase");
  eraseButton.mousePressed(function(){
    
    mouseMode = "erase";
    qPoints = [];
    
  });
}

function genData(x, y){
  
  let p = new ColorDot(createVector(x, y), color(random(255),random(255),random(255)), random(2,5));
  return p;
  
}

function updateBoard(){
  
  let oldPoints = Board.queryAllPoints();
  let updatedPoints = [];
  oldPoints.forEach(old => {
    
    let updated = new ColorDot(old.position, old.color, old.radius);
    updated.clone(old);
    updated.update();
    updatedPoints.push(updated);
    
  })
  
  Board.clear();
  updatedPoints.forEach(up => {
    
    Board.insert(up.position, up);
    
  }) 
}

function showFPS(){
  stroke(255,0,0);
  strokeWeight(0.5);
  fill(255,0,0);
  textSize(20);
  text(round(frameRate()), width-24, 18)
  strokeWeight(2);
}
