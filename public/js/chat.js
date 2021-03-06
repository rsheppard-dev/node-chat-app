const socket = io()

// elements
const form = document.getElementById('chat-form')
const messageInput = form.querySelector('input')
const messageButton = form.querySelector('button')
const locationButton = document.getElementById('share-location')
const messages = document.getElementById('messages')
const sidebar = document.getElementById('sidebar')

// templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new message element
    const newMessage = messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height
    visibleHeight = messages.offsetHeight

    // height of messages container
    const containerHeight = messages.scrollHeight

    // how far have i scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('message', message => {
    console.log(message.text)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('locationMessage', location => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
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

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})