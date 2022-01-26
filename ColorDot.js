class ColorDot{
  
  constructor(position, color, radius){
    
    this.position = position;
    this.color = color;
    this.radius = radius;
    this.velocity = p5.Vector.random2D();
    
  }
  
  clone(other){
    
    this.position = other.position.copy();
    this.color = color(other.color);
    this.radius = other.radius;
    this.velocity = other.velocity.copy(); 
    
  }
  
  update(){
    
    this.position.add(this.velocity);
    this.position.x = (this.position.x % width + height) % height;
    this.position.y = (this.position.y % height + height) % height;
    
  }
  
  display(){
    
    stroke(0);
    fill(this.color);
    circle(this.position.x, this.position.y, this.radius*2);
    
  }
  

  
}
