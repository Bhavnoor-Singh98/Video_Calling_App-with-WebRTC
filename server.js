// creating express server
const express= require('express')
const app = express()

// creating server to use with socket io
const server = require('http').Server(app)

// server is passed in return of require() below
const io = require('socket.io')(server)

const { v4: uuidV4 } = require('uuid')
const { Socket } = require('net')

//setting express server so that we can route at this home page
app.set('view engine', 'ejs')

// static folder which is public and has all our JS and CSS
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})



// creating room
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // see terminal for output in vs
        //console.log(roomId, userId) 

        //setting up video connection taht someone has joined
        socket.join(roomId)

        // when joins then msg sent to all the room member expect the one who joined 
        socket.to(roomId).broadcast.emit('user-connected', userId)

        // when someone leaves the other person still has the frozen video
        // to remove this problem 

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

// the video will not connect with server rather it will connect with the person's computer
// server is just for setting up our rooms
server.listen(3000)