const socket = io()

const form = document.getElementById('chat-form')

form.addEventListener('submit', e => {
    e.preventDefault()

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message)
    form.reset()
})

socket.on('message', message => {
    console.log(message)
})