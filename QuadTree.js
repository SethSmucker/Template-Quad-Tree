class QuadTree{
  
  constructor(center, halfDim, layer, maxDepth){

    this.layer = layer;
    this.maxDepth = maxDepth;
    this.QT_NODE_CAPACITY = 1;
    this.boundary = new BoundingBox(center, halfDim, layer);
    this.points = [];
    
    this.northWest = null;
    this.northEast = null;
    this.southWest = null;
    this.southEast = null;

  }
  
  clear(){
    
    this.points = [];
    this.northWest = null;
    this.northEast = null;
    this.southWest = null;
    this.southEast = null;
    
  }

  insert(position, data){
    
    //case: point is not in this box, do nothing.
    if(!this.boundary.containsPoint(position)){
      return false; 
    }
      
    //case: the point ends up in this node, add it.
    if((this.points.length < this.QT_NODE_CAPACITY && this.northWest == null) || this.layer == this.maxDepth){

      this.points.push(new Point(position, data));
      return true;
      
    }
    
    //case: the point goes here but there's no space, subdivide this box.
    if(this.northWest == null){
      this.subdivide();
    }
    
    //inserts the point into the correct subpartition
    if(this.northWest.insert(position, data)){ return true; }
    if(this.northEast.insert(position, data)){ return true; }
    if(this.southWest.insert(position, data)){ return true; }
    if(this.southEast.insert(position, data)){ return true; }
    
    return false;
    
  }
  
  delete(position){
  
    //case: the point is not in this box, do nothing.
    if(!this.boundary.containsPoint(position)){
      return false; 
    }
    
    //case: this is an internal node, delete the point from the leaf 
    //                                and consolidate if necessary.
    if(this.northWest != null){
      
      if(this.northWest.delete(position)){ this.consolidate(); return true; }
      if(this.northEast.delete(position)){ this.consolidate(); return true; }
      if(this.southWest.delete(position)){ this.consolidate(); return true; }
      if(this.southEast.delete(position)){ this.consolidate(); return true; }
      
    }else{
      
      //case: this is a leaf point, delete point from here if it exists.
      for(let i = 0; i < this.points.length; i++){
        
        if(position.x == this.points[i].position.x && position.y == this.points[i].position.y){
          
          this.points.splice(i, 1);
          return true;
          
        }
      }
    }
    
    return false;
    
  }
  
  subdivide(){
    
    //create subpartitions
    this.northWest = new QuadTree(createVector(this.boundary.center.x - this.boundary.halfDim/2, this.boundary.center.y - this.boundary.halfDim/2), this.boundary.halfDim/2, this.layer + 1, this.maxDepth);
    this.northEast = new QuadTree(createVector(this.boundary.center.x + this.boundary.halfDim/2, this.boundary.center.y - this.boundary.halfDim/2), this.boundary.halfDim/2, this.layer + 1, this.maxDepth);
    this.southWest = new QuadTree(createVector(this.boundary.center.x - this.boundary.halfDim/2, this.boundary.center.y + this.boundary.halfDim/2), this.boundary.halfDim/2, this.layer + 1, this.maxDepth);
    this.southEast = new QuadTree(createVector(this.boundary.center.x + this.boundary.halfDim/2, this.boundary.center.y + this.boundary.halfDim/2), this.boundary.halfDim/2, this.layer + 1, this.maxDepth);
    
  
    //copy down points this box is currently holding
    this.points.forEach(p => {
      this.northWest.insert(p.position, p.data);
      this.northEast.insert(p.position, p.data);
      this.southWest.insert(p.position, p.data);
      this.southEast.insert(p.position, p.data);
    })
    
    this.points = [];
    
  }
  
  queryRangeRect(topL, botR){
    
    rect(topL.x, topL.y, botR.x - topL.x, botR.y - topL.y)
    
    let allPoints = []
    
    if(topL.x > this.boundary.center.x + this.boundary.halfDim || 
       botR.x < this.boundary.center.x - this.boundary.halfDim || 
       topL.y > this.boundary.center.y + this.boundary.halfDim || 
       botR.y < this.boundary.center.y - this.boundary.halfDim){
      
      return allPoints;
      
    }
    
    if(this.northWest != null){
      allPoints = allPoints.concat(
        this.northWest.queryRangeRect(topL, botR),
        this.northEast.queryRangeRect(topL, botR),
        this.southWest.queryRangeRect(topL, botR),
        this.southEast.queryRangeRect(topL, botR)
      );
      
    }else{
      this.points.forEach(p => {
        
        if(p.position.x >= topL.x && p.position.x <= botR.x &&
           p.position.y >= topL.y && p.position.y <= botR.y){
          
          allPoints.push(p.data);
          
        } 
      })       
    }
      
    return allPoints;
    
  }
  
  queryAllPoints(){
    
    let allPoints = []
    
    if(this.northWest != null){
      allPoints = allPoints.concat(
        this.northWest.queryAllPoints(),
        this.northEast.queryAllPoints(),
        this.southWest.queryAllPoints(),
        this.southEast.queryAllPoints()
      );
      
    }else{
      this.points.forEach(p => {allPoints.push(p.data);})       
    }
    
    return allPoints;
    
  }
  
  queryRangeCirc(center, radius){
    
    let allPoints = [];
    
    let distX = Math.abs(center.x - this.boundary.center.x);
    let distY = Math.abs(center.y - this.boundary.center.y);
    
    //if circle is completely out or range of this bounding box, return no points
    if(distX > (this.boundary.center.x + radius) || (distY > (this.boundary.center.y + radius))) return allPoints;

    let dx = distX-this.boundary.center.x;
    let dy = distY-this.boundary.center.y;
    
    if(distX <= this.boundary.center.x || distY <= this.boundary.center.y || dx*dx+dy*dy <= radius*radius){
      if(this.northWest != null){

        allPoints = allPoints.concat(
          this.northWest.queryRangeCirc(center, radius),
          this.northEast.queryRangeCirc(center, radius),
          this.southWest.queryRangeCirc(center, radius),
          this.southEast.queryRangeCirc(center, radius)
        );

      }else{

        this.points.forEach(p => {

          let distX = abs(p.position.x - center.x);
          let distY = abs(p.position.y - center.y);

          let d = sqrt(distX*distX + distY*distY);

          if(d <= radius){
            
            allPoints.push(p.data);
          }
        })       
      }
    }

    return allPoints;
    
  }
  
  consolidate(){ 
    
    //if this point has child points that are all empty, delete them.
    if(this.northWest != null &&
       this.northWest.points.length == 0 && this.northWest.northWest == null &&
       this.northEast.points.length == 0 && this.northEast.northWest == null &&
       this.southWest.points.length == 0 && this.southWest.northWest == null &&
       this.southEast.points.length == 0 && this.southEast.northWest == null){

      this.northWest = null;
      this.northEast = null;
      this.southWest = null;
      this.southEast = null;

    }    
  }
  
  display(){
    
    this.boundary.display();
    
    if(this.northWest != null){
      
      this.northWest.display();
      this.northEast.display();
      this.southWest.display();
      this.southEast.display();
      
    } else {
      
      this.points.forEach(p => {
        
        p.display();
        
      })  
    }
  }
  
  displayData(){
    
    this.boundary.display();
    
    if(this.northWest != null){
      
      this.northWest.displayData();
      this.northEast.displayData();
      this.southWest.displayData();
      this.southEast.displayData();
      
    } else {
      
      this.points.forEach(p => {
        p.displayData();
        
      })  
    }
  }
}

class BoundingBox{
  
  constructor(center, halfDim, layer){
    
    this.center = center;
    this.halfDim = halfDim;
    this.layer = layer
    
  }
  
  display(){
    
    stroke(0,0,0);
    fill(0, 0, 0, 10*this.layer);
    square(this.center.x - this.halfDim, this.center.y - this.halfDim, this.halfDim*2);
    
  }
  
  containsPoint(position){
    
    if(position.x <= this.center.x + this.halfDim &&
       position.x >= this.center.x - this.halfDim &&
       position.y <= this.center.y + this.halfDim &&
       position.y >= this.center.y - this.halfDim){
      
      return true;
    }
    
    return false;
  }
  
}

class Point{
  
  constructor(position, data){
    
    this.position = position;
    this.data = data;
    
  }
  
  //checks if this.data points to the same object that other does
  equals(other){
    
    return (this.data === other.data ? true : false);
    
  }
  
  display(){
    
    stroke(0,0,0);
    circle(this.position.x, this.position.y, 3);
    
  }
  
  displayData(){
    
    this.data.display();
    
  }
  
}
