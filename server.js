var express = require('express');
var app = express();
const port = process.env.PORT || 5500
var server = app.listen(port , ()=>{
    console.log(`App started add port : ${port}`)
});
//var server = app.listen(3000);
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);
const allPlayers = {}
var playerCount = 0
var sortinteval ;

function newConnection(socket){ 
    io.to(socket.id).emit("homescreen")
    socket.on('disconnect' , ()=>{
        delete allPlayers[socket.id]
        io.emit('deleteenmey',socket.id)
        if(playerCount > 0 ) playerCount--
        if(playerCount == 0){
            clearInterval(sortinteval)
        }
    })
    socket.on('location' , (location)=>{
        io.emit('opponentlocation',(location))
    })
    socket.on('shot',(newBullet)=>{
        io.emit("shot",{newBullet,socketid:socket.id})
    })
    socket.on('hitindex',(hitIndex)=>{
        io.emit("hitindex",{hitIndex})
    })
    socket.on('getscore' ,  (playerid)=>{
        io.to(playerid).emit("getscore");
    })
    socket.on('death',()=>{
        delete allPlayers[socket.id]
        io.emit('deleteenmey',socket.id)
    })
    socket.on('ready',()=>{
        const newPlayer = createNewPlayer(socket)
        allPlayers[socket.id] = newPlayer
        io.to(socket.id).emit("start", {newPlayer , allPlayers});
        io.emit('newenemy',newPlayer)
        playerCount++
        if(playerCount == 1){
            sortinteval = setInterval(Sort , 3000)
        }

    })
    socket.on('chatdata', (data)=>{
        io.emit('chatdata',data)
    })
    socket.on('sendMoney' , (amount)=>{
        if(allPlayers[socket.id] != undefined){
            allPlayers[socket.id].money = amount
        }

    })
}
function createNewPlayer(socket){
    const player = {
        socketid : socket.id,
        startx : Math.floor(Math.random()*1700 + 100),  
        starty : Math.floor(Math.random()*800 + 100),
        money : 100
    }   
    return player
}

function Sort(){
    let arrayFromEntries = Object.entries(allPlayers);
    let sortedData = [arrayFromEntries].sort((a, b)=> {return b.money - a.money});
    io.emit("sortedData" , sortedData)
}