const mongoose = require('mongoose')

const credentials = require('./credentials/credentials')

const env = process.env.NODE_ENV || "development"

const { connectionString } = credentials.mongo[env]

if(!connectionString) {
    console.error('MongoDB connection string missing!')
    process.exit(1)
}

mongoose.connect(connectionString, {
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true})

const db = mongoose.connection
db.on('error', err => {
    console.error('MongoDB error: ' + err.message)
    process.exit(1)
})

let gridFSBucket
let gfs

db.once('open', () => {
    console.log('MongoDB connection established')
})

const Registration = require('./models/registration')
const Room = require('./models/room')
const Messages = require('./models/messages')
const Notifications = require('./models/notification')
const Photos = require('./models/photos')

function filterUsers(login, arr=[]){
    // login = login.trim().toLowerCase()

    if (arr.length){
        const[obj] = arr
        const {log_pass} = obj
        const match = log_pass.find( user => user.login === login )

        if (match) return true
        if(!match) return null
    }
}

function filterRooms(data, arr=[]){

    if (arr.length){
        const[obj] = arr
        const {room} = obj

        //console.log(room)
        const match = room.find(item=> item.room === data)
        if (match) return true
        if (!match) return null
    }
}

function filterRoomsList(arr=[]){
    //console.log(arr)
    if (arr.length){
        const[obj] = arr
        const{room}=obj

        return {room, err: ''}
    }else {
        return {room: null, err: "There is no room..."}
    }
}

module.exports = {
    retrievePhotos: async (user)=>{
        return Photos.findOne({user})
    },
    storePhotos: async (user, newName, oldName, filepath, pathToDir, fullPath)=>{
        await Photos.updateOne(
            {user: user},
            {newName, oldName, filepath, pathToDir, fullPath},
            {upsert: true}
        )
    },
    setLogPass: async (login, password)=>{

        login = String(login).trim().toLowerCase()
        password = String(password).trim().toLowerCase()

        const list = await Registration.find({},{ _id: 0, __v: 0})

        if (filterUsers(login, list)){
            return {message: "Users can't share the same name. May be you choose another name...?"}
        }else {
            await Registration.updateOne(
                {"createdAt": '14.02.2021 at 03:34'},
                {$push:
                        {log_pass: {$each: [{login, password}], $slice: -10}}},
                {upsert: true}
            )
            return  Registration.find({},{ _id: 0, __v: 0})
        }
    },

    getLogPass: async ()=>{
        return  Registration.find({},{ _id: 0, __v: 0})
    },

    getOneUser: async (login, password)=>{
        login = String(login).trim().toLowerCase()
        password = String(password).trim().toLowerCase()
        return Registration.findOne({"log_pass.login":login, "log_pass.password": password})
    },
    setRoom: async (room, name, close)=>{
        room = String(room).trim().toLowerCase()
        name = String(name).trim().toLowerCase()

        const list = await Room.find({},{ _id: 0, __v: 0})

        if (filterRooms(room, list)){
            return {err: "Your chosen room already exists, create another...", room: null}

        }else {
            await Room.updateOne(
                {"createdAt": '18.02.2021 at 14:43'},
                {$push: {room: {$each: [{room, name, close, users:[name]}]}}},
                {upsert: true}
            )

            const roomList= await Room.find({},{ _id: 0, __v: 0})
            // console.log(roomList)

            return filterRoomsList(roomList)
        }
    },
    getRoomsList: async ()=>{
        const roomsList = await Room.find()
        return filterRoomsList(roomsList)
    },
    alterRoomList: (criteria=null, obj=null)=>{
        if (criteria && !obj){
            return Room.findOne(criteria)
        }
        if (criteria && obj){
            return Room.replaceOne(criteria, obj)
        }
        return Room.find()
    }
    ,
    storeMessages: async (data)=>{
        // console.log(data)
        // console.log(data.user.room)

        await Messages.updateOne(
            {"createdAt": '21.02.2021 at 20:24'},
            {$push:{message:{$each: [{...data}]}}},
            {upsert: true}
        )

        return true
    },
    getMessages: async (room)=>{
        return Messages.find()
    },
    storeRequestNotifications: async (data)=>{
        const dbData = await Notifications.find()
        // console.log(dbData.length)
        // console.log(data.room)
        // console.log(data.admin)
        // console.log(data.applicant)

        if (dbData.length){
            const [obj]=dbData
            const {notify}=obj
            const{room, admin, applicant}=data
            const match = notify.find(item=> item.room === room && item.admin === admin && item.applicant === applicant)
            // console.log(match)

            if (match){
                return [{message: "You already have sent a request for " + room, status: false}]
            }
            if (!match){
                await Notifications.updateOne(
                    {"createdAt": '21.02.2021 at 16:15'},
                    {$push: {notify:{$each: [data]}}},
                    {upsert: true}
                )

                const arr = await Notifications.find()
                arr.unshift({message: "", status: true})
                // console.log(arr)

                return arr
            }
        }

        //Otherwise make a simple update
        if (!dbData.length){
            await Notifications.updateOne(
                {"createdAt": '21.02.2021 at 16:15'},
                {$push: {notify:{$each: [data]}}},
                {upsert: true}
            )
            const arr = await Notifications.find()
            arr.unshift({message: "", status: true})
            // console.log(arr)

            return arr
        }
    },
    getNotifications: (criteria=null)=>{
        if (criteria){
            return Notifications.updateOne({},{$pull:{notify:{...criteria}}})
        }
        return Notifications.find()
    }
}