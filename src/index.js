const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io').listen(server)
const cors = require('cors')

let players = []

app.use(cors())

app.get('/', (req, res) => {
    res.send({ status: 200 })
})

io.on('connection', socket => {
    
    console.log('Novo jogador na sala!')

    let position = {
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 700) + 50
    }

    players.push({
        x: position.x,
        y: position.y,
        playerId: socket.id,
        score: 0
    })
    
    socket.emit('currentPlayers', players)
    
    socket.broadcast.emit('newPlayer', { 
        x: position.x, 
        y: position.y, 
        score: 0, 
        playerId: socket.id 
    })
    
    socket.on('playerMovement', moveData => {
        players.map(player => {
            if (player.playerId === socket.id) {
                player.x = moveData.x
                player.y = moveData.y
            }
        })
        socket.broadcast.emit('playerMoved', players)
    })

    socket.on('playerMovement', function (movementData) {
        players.map(player => {
            if (player.playerId == socket.id) {
                player.x = movementData.x
                player.y = movementData.y
                socket.broadcast.emit('playerMoved', player)
            }    
        })
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectou. ${socket.id}`)
        players = players.filter(player => {
            if (player.playerId !== socket.id) {
                return player
            }
        })
        io.emit('disconnect', socket.id)
    })
})

server.listen(8081, () => {
    console.log(`Listening on ${server.address().port}`)
})