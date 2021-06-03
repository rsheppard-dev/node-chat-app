const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New WebSocket connection.')

  socket.emit('message', 'Welcome!')
  socket.broadcast.emit('message', 'A new user has joined the chat!')

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('message', message)
    callback()
  })

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    io.emit('locationMessage', `https://www.google.com/maps?q=${latitude},${longitude}`)
    callback()
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left the chat!')
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})