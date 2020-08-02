// socket is going to connect at root
const socket=io('/')

// getting video grid of all the videos
const videoGrid = document.getElementById("video-grid")

// Peer server takes the WebRTC infofor a user and turns into:
// 438471b2-ca48-43f9-ace6-5016d9cd0d60
// undefined bcoz we want server to take care
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

// getting reference to my video
const myVideo = document.createElement('video')

// record of people we called
// here it is empty object 
// see connectToNewUser() 
    const peers = {}

// we are going to mute ourselves bcoz we donot want to listen to our own voice
// it is not gonna mute us for other people
myVideo.muted=true

// to connect our video we will do 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true


    // bcoz it was a callback ftn so we need to use then
    // stream is going to carry our audio and video
}).then(stream => {
    // streaming of video
    addVideoStream(myVideo, stream)

// to make both the users video visible on both screens
    myPeer.on('call', call => {
        // when someone calls then stream starts
        call.answer(stream)


        const video = document.createElement('video')
        // response to the person who called
        // we will stream video of the other user  
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })


    // now we need to allow to connect with other user
    socket.on('user-connected', userId => {

        // this ftn sends our userid and audio and video
        connectToNewUser(userId, stream)
    })
})

// when one user is disconnected
    socket.on('user-disconnected', userId => {
        //console.log(userId)
        // closing the connection of the disconnected one
        if(peers[userId])
          peers[userId].close()
    })

// on connecting with peer server and get back an id we want to run the following code
// here id of user
myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream)
{
    // we are sending our stream
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')

    // upon sending our stream we want their stream and we get it through
    // userVideoStream
    call.on('stream', userVideoStream => {
        // adding user video stream
        addVideoStream(video, userVideoStream)
    })
    // when someone wants to close the call
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call 
}

// emit is going to send an event to server with Room_id= roomId and 10=user id
// socket.emit('join-room', ROOM_ID, 10)

// socket.on('user-connected', userId => {
//     console.log('User Connected: ' + userId)
// })


function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    // appending video to grid
    videoGrid.append(video)
}