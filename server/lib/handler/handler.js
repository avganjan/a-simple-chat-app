const pathUtils = require('path')
const fs = require('fs')
const db = require('../../db')

exports.api = {}

const dataDir = pathUtils.resolve(__dirname, '../../../', 'public')
const avatarPhotosDir = pathUtils.join(dataDir, 'avatar-photos')
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
if(!fs.existsSync(avatarPhotosDir)) fs.mkdirSync(avatarPhotosDir)

const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)

exports.api.chatAvatar = async (req, res, fields, files)=>{
    let user = fields.user[0]
    let fullPath = fields.fullPath[0]
    let pathToDir = fields.pathToDir[0]
    user = String(user).trim().toLowerCase()
    // console.log(user)
    console.log(fullPath)
    console.log('pathToDir - ' + pathToDir)

    const photo = files.photo[0]
    const contentType = photo.headers['content-type']
    // console.log(photo)
    const dateNow = Date.now()
    const ext = contentType.replace('image/', '.')
    const newName = dateNow + ext
    // console.log(newName)
    const dir = avatarPhotosDir + '/' + dateNow
    // console.log(dir)

    const path = dir + '/' + photo.originalFilename
    await mkdir(dir)

    await fs.readFile(photo.path, (err, data)=> {
        if (err) throw err;

        // console.log(photo.path)
        console.log('File read!');

        // Write the file
        fs.writeFile(path, data,  (err)=> {
            if (err) throw err;
            console.log('File written!');
            console.log(photo.headers['content-type'])

            if (contentType === 'image/png' || contentType === 'image/jpeg'){
                if (path.endsWith(photo.originalFilename)){

                    const newPath = path.replace(photo.originalFilename, newName)
                    fs.rename(path, newPath , err =>{
                        if (err) throw err
                        if (fullPath && pathToDir){
                            fs.unlink(fullPath, err =>{
                                if (err) return console.log(err)

                                fs.rmdir(pathToDir, err =>{
                                    if (err) return console.log(err)
                                    console.log(`${fullPath} deleted`)
                                    res.json({filepath: `/avatar-photos/${dateNow}/${newName}`, fullPath: newPath, pathToDir: dir, user})
                                })
                            })
                        }

                        db.storePhotos(user, newName, photo.originalFilename, `/avatar-photos/${dateNow}/${newName}`, dir, newPath)

                        if (!fullPath || !pathToDir){
                            res.json({filepath: `/avatar-photos/${dateNow}/${newName}`, fullPath: newPath, pathToDir: dir, user})
                        }

                        console.log(`File ${photo.originalFilename} rewritten to ${newName}!`)
                    })
                }
            }
        });

        // Delete the file
        fs.unlink(photo.path, (err)=> {
            if (err) throw err;

            // console.log(photo.path)
            console.log('File deleted!');
        });
    })
}

exports.api.getAvatar = async (req, res, next)=>{
    let {user} = req.body
    user=String(user).trim().toLowerCase()
    // console.log(user)

    try{
        const avatarData = await db.retrievePhotos(user)
        // console.log(avatarData)
        if (avatarData) return res.json({
                filepath: avatarData.filepath,
                pathToDir: avatarData.pathToDir,
                fullPath: avatarData.fullPath,
                newName: avatarData.newName,
                oldName: avatarData.oldName,
                user: avatarData.user,
            })
        if (!avatarData) return res.json({filepath: ''})
    }catch (err){
        console.log(err)
    }

}

exports.getAvatar = async (usersArr=[])=>{

    return  await Promise.all(usersArr.map(async (user) => {
        try {
            const avatarData = await db.retrievePhotos(user)
            if (avatarData){
                // console.log(avatarData)
                return ({user: avatarData.user, filepath: avatarData.filepath})
            }
            console.log(user)
            return ({user: user, filepath: ''})
        }
        catch (e){
            console.log(e)
        }
    }));

}

exports.api.Registration = async (req, res, next)=>{
    console.log(req.body.login)
    console.log(req.body.pass)

    try{
        const resp = await db.setLogPass(req.body.login, req.body.pass)

        if (resp.message) {
            res.json({users: null, err: resp.message, authorized: false, name: ''})
        }else {
            const[users] = resp
            // console.log(users)
            res.json({users, err: null, authorized: true, name: req.body.login})
        }

    }catch (e) {
        console.log(e)
    }
}

exports.api.Login = async (req, res, next)=>{
    console.log(req.body.login)
    console.log(req.body.pass)

    try {
        const list = await db.getOneUser(req.body.login, req.body.pass)

        if (list) return res.json({err: null, authorized: true, name: req.body.login})
        if (!list) return res.json({err: "Such user doesn't exist", authorized: false, name: ''})

    } catch (e) {
        console.log(e)
    }

}

exports.api.Room = async (req, res, next)=>{
    console.log(req.body)

    const list = await db.setRoom(req.body.room, req.body.name, req.body.close)

    if (list.err) return res.json({err: list.err, room: null, authorized: false})

    return res.json({err: null, room: list.room, authorized: true})
}

exports.api.roomList = async (req, res, next)=>{
    //console.log(req.body.req)
    const response = await db.getRoomsList()
    res.json({...response})
}

exports.api.storeMessages = async (data)=>{
    // console.log(data)
    return await db.storeMessages(data)
}

exports.api.getMessages = async (room='')=>{
    //console.log(room)

    let result = await db.getMessages()

    // console.log(result)

    if (result.length){
        const [obj]=result
        const{message}=obj
        // console.log(message)
        return message.filter(item =>
            Object.keys(item)[0] === room
        )
    }else {
        return result
    }
}

exports.api.storeNotifications = async (data)=>{
    if (data){
        return await db.storeRequestNotifications(data)
    }
}

exports.api.getNotifications = async (req, res, next)=>{
    // console.log(req.body)
    const dbData = await db.getNotifications()
    // console.log(dbData)
    if (dbData.length && req.body.admin){
        let admin = String(req.body.admin).trim().toLowerCase()
        const[obj]=dbData
        const{notify}=obj

        const match = notify.filter(item=>
            item.admin === admin
        )
        if (match.length) return res.json({list: [...match], count: match.length})
        if (!match.length) return res.json({list: [...match], count: 0})

    }
}

exports.api.catchPermission = async ({body:{deny, permit}}, res, next)=>{
    // console.log(deny)
    // console.log(permit)

    const dbObj= await db.alterRoomList()
    // console.log(roomsList[0].room)
    if (permit && dbObj.length){
        const[obj]=dbObj
        const{room, id}=obj
        // console.log(id)

        const newRoomList = room.map(item=>{
            return (item.room === permit.room && item.name === permit.admin) ?
                {...item, users: [...item.users, permit.applicant]} : item
        })

        const dbObj2 = await db.alterRoomList({"_id": id})
        // console.log(dbObj2)
        dbObj2.room=newRoomList
        const dbResponse = await db.alterRoomList({"_id": id}, dbObj2)

        if (dbResponse.nModified){
            // console.log(dbResponse)

            const dbNoteList = await db.getNotifications(permit)
            if (dbNoteList){
                console.log(dbNoteList)
            }
            res.json({resp: {...dbResponse}})
        }
    }
}
