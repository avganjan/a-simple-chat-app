const http = require('http');
const app = require('express')();
const socketio = require('socket.io');
const cors = require('cors');
const multiparty = require('multiparty')
const server = http.createServer(app);
const io = socketio(server);

const bodyParser = require('body-parser')

require('./db')

app.use("/api", cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const handler = require('./lib/handler/handler')
const{addUser, findAdmin, removeUser, structureStack, usersInComments, usersList, deletedUsers}=require('./lib/helper/helper')

// @route POST /api/login/pass/set
// @desc Save a login and password
app.post('/api/login/pass/set', handler.api.Registration)

// @route POST /api/log/in
// @desc Log in by saved log and pass
app.post('/api/log/in', handler.api.Login)

// @route POST /api/chat/user/room/set
// @desc Save the data of newly created room in db
app.post('/api/chat/user/room/set', handler.api.Room)

// @route POST /api/get/rooms/list
// @desc Getting the rooms saved in db
app.post('/api/get/rooms/list', handler.api.roomList)

// @route POST /api/get/notifications/list
// @desc If any, get notifications for joining a room
app.post('/api/get/notifications/list', handler.api.getNotifications)

// @route POST /api/sent/permit/data
// @desc Sending a request for getting a Permission to room or rooms
app.post('/api/sent/permit/data', handler.api.catchPermission)

// @route POST /api/get/default/avatar
// @desc Deriving the necessary data of the user avatar
app.post('/api/get/default/avatar', handler.api.getAvatar)

//@route POST /api/avatar/image
//@desc Uploading the user's image to filesystem and the additional info to db
app.post("/api/avatar/image", async (req, res)=>{
  const form = new multiparty.Form()
  form.parse(req, (err, fields, files) => {
    if(err) return console.log("Error occurred!")
    // console.log('got fields: ', fields)
    // console.log('and files: ', files)

    handler.api.chatAvatar(req, res, fields, files)
  })
})

let anRoomAbove={}
//A vessel for storing joined users in
let storage=[]

//Establishing connection to client
io.on("connection", (socket)=>{
  console.log('Connection to the client established...')

  socket.on("join", ({room, name, id, admin, prev}, callback)=>{
    //debugging
    console.log("user's name - " + admin)

    if (!prev){
      // console.log(prev)
      socket.join(room)
      // socket.user = room
      storage = addUser(id, admin, room)
      // console.log(storage)

      anRoomAbove.user = room

      io.to(room).emit("user joined room", admin, id)
    }
    if (prev){
      socket.leave(prev.room)
      socket.to(prev.room).emit("user left room", admin, prev.id)
      removeUser(socket.id)

      socket.join(room)
      storage = addUser(id, admin, room)
      anRoomAbove.user = room

      io.to(room).emit("user joined room", admin, id)
    }

    //Deriving the saved messages from db for a specific room
    socket.on("initial messages", async (room, close, users, name, callback)=>{
      if (room){
        name=String(name).trim().toLowerCase()

        //Getting and fitting the message data from db
        const arr = await handler.api.getMessages(room)
        const comments = await structureStack(arr, room)

        //Getting users out of the messages for determining for
        // each of them his proper icon
        const usersInCom = await usersInComments(comments)
        const photoData = await handler.getAvatar(usersInCom)
        const match = users.find(user=> user === name)


        //Showing up the private and public rooms
        if(comments.length){

          //if true, open the access, else leave it closed
          if (match) return callback({comments, photoData, room, bool: true})
          if (!match && !close) return callback({comments, photoData, room, bool: true})
          if (!match && close) return callback({comments, photoData, room, bool: false})
        }
      if (!comments.length){
        if (match){
          return callback({comments, photoData, room, bool: true})
        }
        if (!match && !close){
          return callback({comments, photoData, room, bool: true})
        }
        if (!match && close){
          return callback({comments, photoData, room, bool: false})
        }
      }}
    })
  })

  //Catching client's request for the access to the specific room
  socket.on("applicant request", async (request,{id, admin}, callback)=>{

    const resp = await handler.api.storeNotifications(request)

    //if response from db is true and err obj(resp[0].message) ist true,
    // it means such request is already sent, else request is stored to db
    // and a success response goes to client
    if (resp.length){
      // console.log(resp)
      if (resp[0].message && !resp[0].status){
        callback({...resp[0]})
      }
      if (!resp[0].message && resp[0].status){
        // console.log(resp)
        callback({...resp[0]})
      }
    }

    //If such user is registered, getting his id
    // and sending him the request for the access to specific private room
    if (storage.length){
      const admin = storage.find(item=> item.name === request.admin)

      if (admin){
        io.to(admin.id).emit("notification", request)
      }
    }
  })

  //Storing messages to db
  socket.on("store messages", async (messageData, room, user) =>{

    //Fitting the messages for storing to db
    let data = {}
    if (messageData && room && user){
      data[room] = {message: messageData, user}
      const resp = await handler.api.storeMessages(data)

      if (resp){
        //if successful stored, get them out
        const arr = await handler.api.getMessages(room)

        //Getting users out of the messages for determining for
        // each of them his proper icon
        const comments = await structureStack(arr, room)
        const usersInCom = await usersInComments(comments)
        const photoData = await handler.getAvatar(usersInCom)
        // console.log(comments)

        //Deriving all connected users and sending them the messages
        storage.map((item)=>{
          item.room === room ?
              io.to(item.id).emit("stored  messages", comments, photoData) :
              null
        })
      }
    }
  })

  socket.on("disconnect", ()=>{
    // removing the disconnected user
    const user = removeUser(socket.id)
    const users = usersList()
    const deletedList = deletedUsers()

    if (user){

      // sending the disconnected user's data to all clients of the current room
      io.to(user.room).emit("removed", user)
      io.to(user.room).emit("residual", users, deletedList)
    }
  })

})

server.listen(process.env.PORT || 4040, () => console.log(`Server has started.`));