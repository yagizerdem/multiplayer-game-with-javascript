class Machine {
  static size = 40;
  constructor(x, y , damage ,healt , id , name , maxHealt) {
    this.id = id
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.range = 200;
    this.angle = 0; // radian
    this.radius = 250
    this.damage = damage
    this.healt = healt
    this.coolDown = Date.now()
    this.name = name
    this.maxHealt = maxHealt
    }
  draw(moveCanvas) {
    context.beginPath();

    context.save();
    context.translate(this.x + Machine.size / 2, this.y + Machine.size / 2);
    context.rotate(-this.angle);
    context.translate(
      -(this.x + Machine.size / 2),
      -(this.y + Machine.size / 2)
    );

        // hitbox
        // context.rect(this.x, this.y,Machine.size,Machine.size)
        // context.fillStyle = 'red'
        // context.fill()
        // context.closePath()
        // context.beginPath();
    // draw img
    var img = new Image();
    img.src = "./machine.png";
    context.drawImage(img, this.x, this.y, Machine.size, Machine.size);

    // draw range 
    context.strokeStyle = 'red'
    context.arc(this.x + Machine.size / 2 , this.y + Machine.size / 2 , this.radius , Math.PI *2 , false)
    context.stroke()

    // move canvas
    if(moveCanvas){
      const cx = window.innerWidth / 2 - this.x;
      const cy = window.innerHeight / 2 - this.y;
      canvas.style.top = `${cy}px`;
      canvas.style.left = `${cx}px`;
    }

    context.restore();
    context.closePath();

    this.drawHead()
    this.drawCenter()
    this.drawHealtBar()
    this.drawName()
  }
  turn(direction) {
    if (direction == Direction.left) {
      this.angle += ((300 / fps) * Math.PI) / 180;
    } else {
      this.angle -= ((300 / fps) * Math.PI) / 180;
    }
  }
  move(direction) {
    if(this.checkBounds(direction)){
        return
    }
    if (direction == Direction.forward) {
      this.x += Math.cos(-this.angle) * this.speed;
      this.y += Math.sin(-this.angle) * this.speed;
    } else {
      this.x -= (Math.cos(-this.angle) * this.speed) / 2;
      this.y -= (Math.sin(-this.angle) * this.speed) / 2;
    }
  }
  findHead() {
    const head = [this.x + Machine.size / 2 , this.y + Machine.size / 2]
    const dx = Math.cos(-this.angle)   *  Machine.size / 2
    const dy = Math.sin(-this.angle)   *  Machine.size / 2
    head[0] += dx
    head[1] += dy
    return head
  }
  // 
  drawHead(){
    const x_y = this.findHead()
    context.beginPath()
        context.rect(x_y[0], x_y[1],5,5)
        context.fillStyle = 'blue'
        context.fill()
    context.closePath()
  }
  drawCenter(){
    context.beginPath()
    context.rect(this.x + Machine.size / 2-3, this.y + Machine.size / 2 - 3  ,6,6)
    context.fillStyle = 'red'
    context.fill()
    context.closePath()
  }
  drawHealtBar(){
    context.beginPath()
    context.fillStyle = 'gray'
    context.rect(this.x , this.y + Machine.size + 15 , 40 , 10 )
    context.fill()
    context.closePath()
    context.beginPath()
    context.fillStyle = 'green'
    context.rect(this.x , this.y + Machine.size + 15 , (this.healt / this.maxHealt)*40 , 10 )
    context.fill()
    context.closePath()
  }
  drawName(){
    context.font = "16px Arial";
    context.fillStyle = "#fff";

    // Draw text on the canvas
    context.fillText(this.name, this.x , this.y - 20);
  }
  checkBounds(direction){
    const x_y = this.findHead()
    if(direction == Direction.forward){
        x_y[0] += Math.cos(-this.angle) * this.speed * 2
        x_y[1] += Math.sin(-this.angle) * this.speed * 2
    }
    else {
        x_y[0] -= Math.cos(-this.angle) * (this.speed * 2 + Machine.size)  
        x_y[1] -= Math.sin(-this.angle) *( this.speed * 2 + Machine.size)
    }

    if(x_y[0] <= 0 || x_y[0] >= canvas.width || x_y[1] <= 0 || x_y[1]>= canvas.height){
        return true
    }
    return false
  }
  checkBullets(){
    const indexed = []
    for(var i = allBullets.length -1 ; i >= 0 ; i--){
      const hypot = Math.hypot(this.x + Machine.size / 2- allBullets[i].x , this.y + Machine.size / 2 - allBullets[i].y)
      if(hypot < 100){
          const diagonal = (Machine.size / 2) *Math.sqrt(2)
          const cx =  this.x  + Machine.size / 2
          const cy = this.y  + Machine.size / 2
          const radian = 45 * Math.PI / 180
          const points = [
            [cx +   diagonal * Math.cos(-radian) , cy + diagonal * Math.sin(-radian)],
            [cx - diagonal * Math.cos(-radian) , cy  - diagonal * Math.sin(-radian)],
            [cx + diagonal * Math.cos(-radian) , cy  - diagonal * Math.sin(-radian)],
            [cx - diagonal * Math.cos(-radian) , cy  + diagonal * Math.sin(-radian)],
          ]
          const head = [
            allBullets[i].x + Bullet.length / 2 + Bullet.length * Math.sqrt(2)  * Math.cos(-allBullets[i].angle) ,
            allBullets[i].y + Bullet.length / 2 +  Bullet.length * Math.sqrt(2) *  Math.sin(-allBullets[i].angle) ,
          ]
          const tail = [
            allBullets[i].x + Bullet.length / 2 + Bullet.length * Math.sqrt(2)  * Math.cos(-allBullets[i].angle) ,
            allBullets[i].y + Bullet.length / 2 +  Bullet.length * Math.sqrt(2) * Math.sin(-allBullets[i].angle) ,
          ]
          var ymax = -1
          var ymin = 1000000
          var xmax = -1
          var xmin = 1000000


          for(var item of points){
            if(item[1] > ymax) ymax = item[1]
            if(item[1] < ymin) ymin = item[1]

            if(item[0] > xmax) xmax = item[0]
            if(item[0] < xmin) xmin = item[0]

            // context.beginPath()
            // context.strokeStyle = 'blue'
            // context.arc(item[0] , item[1], 2 , Math.PI *2 , false)
            // context.stroke()
            // context.closePath()
          }
          if((head[1]< ymax && head[1] > ymin) || (tail[1]< ymax && tail[1] > ymin)){
            if((tail[0] < xmax && tail[0] > xmin) || (head[0] < xmax && head[0] > xmin)){
              player.healt -= allBullets[i].damage
              if(player.healt <=  0){  
                socket.emit("getscore" ,allBullets[i].socketid )
                endGame()
              }
              indexed.push(i)
            }
          }
      }
    }
    return indexed
  }
}
