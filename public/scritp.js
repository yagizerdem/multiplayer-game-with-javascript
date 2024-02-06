const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
canvas.width = 1920;
canvas.height = 1080;
canvas.style.border = "3px solid #fff";
canvas.style.top = window.innerHeight / 2 + "px";
canvas.style.left = window.innerWidth / 2 + "px";
const fps = 50;
const Direction = {
  forward: 0,
  left: 1,
  right: 2,
  backward: 3,
};
const gameScreen = {
  Home : 0,
  Play:1,
  End:2
}

var gameState = gameScreen.Home

var money = 100;
const Fire = 4;
var interval;
var sendMoneyinterval;
const allEnemy = []
const keyPress = [];
const allBullets = [];
var player;

socket.on("homescreen" ,()=>{
  const homescreen = `
  <div class="homeScreen">
  <p>Home screen</p>
  <hr>
  <p>Multiplayer js game </p>
  <hr>
  <p>UpArrow : Move </p>
  <p>LeftRightArrow : Rotate </p>
  <p>W : Fire </p>
  <p>1 : Upgrade range </p>
  <p>2 : Upgrade healt </p>
  <p>3 : Upgrade damage </p>
  <input type="text" placeholder="enter name" id="nameinput">
  <button class="ready" onclick="(()=>{
    startGame()
  }
    )()">Play game</button>
</div>
`

const body = document.querySelector('body');
body.insertAdjacentHTML('beforeend', homescreen);
})
socket.on("start", ({newPlayer , allPlayers}) => {
  const body = document.querySelector('body');
  const name = document.getElementById('nameinput').value
  // console.log(name)
  
// Select the element with class name "homeScreen"
const homeScreenElement = document.querySelector('.homeScreen');

// Check if the element is found before attempting to remove it
if (homeScreenElement) {
  // Remove the element
  homeScreenElement.remove();
} else {
  console.log('Element not found');
}

  player = new Machine(newPlayer.startx, newPlayer.starty, 10, 50 , socket.id , name , 50 );

  Object.keys(allPlayers).forEach(key => {
    if(allPlayers[key].socketid != socket.id) allEnemy.push(new Machine(allPlayers[key].startx, allPlayers[key].starty, 10, 50 , allPlayers[key].socketid , allPlayers[key].name ,allPlayers[key].maxHealt))
  });
  interval = setInterval(animation, 1000 / fps);
  sendMoneyinterval = setInterval(sendMoney,3000)
  addListeneres();
});
socket.on("opponentlocation", (opponentlocation) => {

  if(opponentlocation.id != socket.id){
    for(var enemy of allEnemy){
      if(enemy.id == opponentlocation.id){
        enemy.x = opponentlocation.topx
        enemy.y = opponentlocation.topy
        enemy.angle = opponentlocation.angle
        enemy.radius = opponentlocation.radius
        enemy.healt = opponentlocation.healt
        enemy.damage = opponentlocation.damage
        enemy.maxHealt=opponentlocation.maxHealt
        enemy.name = opponentlocation.name
      }
    }
  }
});
socket.on("newenemy",(data)=>{
  if(data.socketid != socket.id){
    allEnemy.push(new Machine(data.startx, data.starty, 10, 50 , data.socketid , data.name , 50))
  }
})
socket.on("deleteenmey",(socketid)=>{
  for(var i =  allEnemy.length -1  ; i >= 0 ; i--){
      if(allEnemy[i].id == socketid ){
        allEnemy.splice(i , 1)
        break
      }
  }
})
socket.on("shot",({newBullet , socketid})=>{
  if(socketid != socket.id){
    const bullet = new Bullet(newBullet.x , newBullet.y,newBullet.damage,newBullet.angle,newBullet.radius , socketid)
    allBullets.push(bullet)
  }
})
socket.on("hitindex",({hitIndex})=>{
  for(var i of hitIndex){
    allBullets.splice(i ,1)
   }
})
socket.on("getscore", ()=>{
  money+= 20
  const moneydiv = document.getElementById("money")
  moneydiv.innerText = `Money : ${money}`
})
socket.on("chatdata",(chatdata)=>{
    const container = `
    <div class="messageContainer">${chatdata}</div>
    `
    const chatScreen = document.getElementById("chatScreen")
    chatScreen.innerHTML = container + chatScreen.innerHTML

  })

socket.on("sortedData",(sortedData)=>{
  const sortedarry = sortedData[0]
  var list = [
    "<li>-</li>",
    "<li>-</li>",
    "<li>-</li>",
    "<li>-</li>",
    "<li>-</li>",
  ]
  console.log([...allEnemy , player ])
  for(var machine of [...allEnemy , player ]){
    for(var i in sortedarry){
      if(machine != undefined && machine.id == sortedarry[i][0]){
        list[i] = machine.name
      }
    }
  }


  const template = `
  <h3 style="color:#fff;font-weight: bolder;">Leader Board</h3>
  <hr>
  <ul>
    ${list.map((item) =>{
      return item.substring(0 ,item.length -1) + "</br>"
    })}
  </ul>
  `
  const ul = document.getElementById("sortedData")
  ul.innerHTML = template
  console.log(sortedarry )
})

function update() {
  movePlayer();
  Shoot();
  for (var i = allBullets.length - 1; i >= 0; i--) {
    const flag = allBullets[i].move();
    if (flag) {
      allBullets.splice(i, 1);
    }
  }
 const hitIndex =  player.checkBullets()
 for(var i of hitIndex){
  allBullets.splice(i ,1)
 }
//  for (var i = allBullets.length - 1; i >= 0; i--) {
//   if(hitIndex.includes(i)){
//     allBullets.splice(i ,1)
//   }
// }
if(hitIndex.length != 0){
  socket.emit("hitindex" ,hitIndex)
}
}
function Shoot() {
  if (keyPress.includes(Fire) && player.coolDown <= Date.now()) {
    const head = player.findHead();
    const newBullet = new Bullet(
      head[0],
      head[1],
      player.damage,
      player.angle,
      player.radius,
      socketid = socket.id
    );
    player.coolDown = Date.now() + 1000 / 10; // 0.1 seconds
    allBullets.push(newBullet);
    socket.emit("shot" , newBullet)
  }
}
function draw() {
  player.draw(true);
  drawBullets();
  drawEnemy()
}
function movePlayer() {
  for (var direction of keyPress) {
    if (direction == Direction.left) {
      player.turn(Direction.left);
    } else if (direction == Direction.right) {
      player.turn(Direction.right);
    } else if (direction == Direction.forward) {
      player.move(Direction.forward);
    } else if (direction == Direction.backward) {
      player.move(Direction.backward);
    }
  }
}
function drawBullets() {
  for (var bullet of allBullets) {
    bullet.draw();
  }
}
function drawEnemy(){
  for(var machine of allEnemy){
    machine.draw(false)
  }
}
const animation = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  update();
  draw();
  sendFrame();
};
function sendFrame() {
  socket.emit("location", {
    topx: player.x,
    topy: player.y,
    angle: player.angle,
    id: socket.id,
    radius:player.radius,
    healt:player.healt,
    damage:player.damage,
    maxHealt:player.maxHealt,
    name:player.name
  });
}

function startGame(){
  socket.emit("ready")
}
function endGame(){
  gameState = gameScreen.End
  clearInterval(interval)
  socket.emit("death")
  
  const endScreen = `
  <div class="endScreen">
  <p>You die</p>
  <hr>
  <p>Multiplayer js game </p>
  <hr>
  <button class="again" onclick="(()=>{
    window.location.reload()
  }
    )()">Again</button>
</div>
  ` 

  const body = document.querySelector('body');
  body.insertAdjacentHTML('beforeend', endScreen);
}

function addListeneres() {
  document.addEventListener("keydown", ({ key, code }) => {
    switch (code) {
      case "ArrowRight":
        if (!keyPress.includes(Direction.right)) keyPress.push(Direction.right);
        break;
      case "ArrowLeft":
        if (!keyPress.includes(Direction.left)) keyPress.push(Direction.left);
        break;
      case "ArrowUp":
        if (!keyPress.includes(Direction.forward))
          keyPress.push(Direction.forward);
        break;
      case "ArrowDown":
        if (!keyPress.includes(Direction.backward))
          keyPress.push(Direction.backward);
        break;
      case "KeyW":
        if (!keyPress.includes(Fire)) {
          keyPress.push(Fire);
        }
        break;
      case "Digit1":
        upgrade("range")
      break;
      case "Digit2":
        upgrade("healt")
      break;
      case "Digit3":
        upgrade("damage")
      break;
    }
  });
  document.addEventListener("keyup", ({ key, code }) => {
    var index;
    switch (code) {
      case "ArrowRight":
        index = keyPress.indexOf(Direction.right);
        break;
      case "ArrowLeft":
        index = keyPress.indexOf(Direction.left);
        break;
      case "ArrowUp":
        index = keyPress.indexOf(Direction.forward);
        break;
      case "ArrowDown":
        index = keyPress.indexOf(Direction.backward);
        break;
      case "KeyW":
        index = keyPress.indexOf(Fire);
        break;
    }
    if (index != -1 && index != undefined) {
      keyPress.splice(index, 1);
    }
  });
}

function sendChat(){
  const input = document.getElementById("chatInput")
  const data = input.value.trim()
  if(data == undefined || data == null || data == ""){
    return
  }
  socket.emit("chatdata" , data)
}
function upgrade(type){
  if(money < 50) return
  if(type == "range"){
    player.radius += 20
    const rangediv = document.getElementById("range")
    rangediv.innerText = `(1)Range : ${player.radius}`
  }
  else if(type == "healt"){
    player.maxHealt += 10
    player.healt += 10
    const healtdiv = document.getElementById("healt")
    healtdiv.innerText = `(2)Healt : ${player.healt}`
  }
  else if(type == "damage"){
    player.damage += 10
    const damagediv = document.getElementById("damage")
    damagediv.innerText = `(3)Damage : ${player.damage}`
  }
  money -= 50

  const moneydiv = document.getElementById("money")
  moneydiv.innerText = `Money : ${money}`
}
function sendMoney(){
  socket.emit("sendMoney" , money)
}