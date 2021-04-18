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

app.post('/api/login/pass/set', handler.api.Registration)
app.post('/api/log/in', handler.api.Login)
app.post('/api/chat/user/room/set', handler.api.Room)
app.post('/api/get/rooms/list', handler.api.roomList)
app.post('/api/get/notifications/list', handler.api.getNotifications)
app.post('/api/sent/permit/data', handler.api.catchPermission)
app.post('/api/get/default/avatar', handler.api.getAvatar)

//file upload part
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
let storage=[]

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
      // socket.user = room
      storage = addUser(id, admin, room)
      // console.log(storage)

      anRoomAbove.user = room

      io.to(room).emit("user joined room", admin, id)
    }

    socket.on("initial messages", async (room, close, users, name, callback)=>{
      //debugging
      // console.log("name - " + name)

      if (room){
        name=String(name).trim().toLowerCase()

        const arr = await handler.api.getMessages(room)
        const comments = await structureStack(arr, room)
        const usersInCom = await usersInComments(comments)
        const photoData = await handler.getAvatar(usersInCom)
        //debugging
        // console.log(arr.length)
        // console.log("usersInCom - " + usersInCom)
        // console.log("photoData - " + JSON.stringify(photoData))

        const match = users.find(user=> user === name)

        if(comments.length){

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

  socket.on("applicant request", async (request,{id, admin}, callback)=>{
    // console.log(storage)
    // console.log(anRoomAbove)

    const resp = await handler.api.storeNotifications(request)
    //debugging
    console.log(JSON.stringify(resp))

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

    if (storage.length){
      const admin = storage.find(item=> item.name === request.admin)

      if (admin){
        io.to(admin.id).emit("notification", request)
      }
    }
  })

  socket.on("store messages", async (messageData, room, user) =>{
    console.log("store messages")

    let data = {}
    if (messageData && room && user){
      data[room] = {message: messageData, user}
      // console.log(data)
      const resp = await handler.api.storeMessages(data)
      if (resp){
        console.log(resp)

        const arr = await handler.api.getMessages(room)
        // console.log(arr)
        const comments = await structureStack(arr, room)
        const usersInCom = await usersInComments(comments)
        const photoData = await handler.getAvatar(usersInCom)
        // console.log(comments)

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