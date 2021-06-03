const socket = io()

// elements
const form = document.getElementById('chat-form')
const messageInput = form.querySelector('input')
const messageButton = form.querySelector('button')
const locationButton = document.getElementById('share-location')
const messages = document.getElementById('messages')

// templates
const messageTemplate = document.getElementById('message-template').innerHTML

socket.on('message', message => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message
    })
    messages.insertAdjacentHTML('beforeend', html)
})

form.addEventListener('submit', e => {
    e.preventDefault()

    messageButton.setAttribute('disabled', 'disabled')

    const message = messageInput.value

    socket.emit('sendMessage', message, error => {
        messageButton.removeAttribute('disabled')

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })

    form.reset()
    messageInput.focus()
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            locationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})