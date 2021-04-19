let storage = []
const messages = []
const deletedList = []

const addUser = (id, name, room)=>{
    name = String(name).trim().toLowerCase()
    room = String(room).trim().toLowerCase()

    const ifEqual = storage.find((user)=> user.id === id)
    // if (!name || !room) return {error: "Enter the name and room data"}
    // if (ifEqual) return {error: "The name must be different"}

    if (!ifEqual){
        const user = {id, name, room}
        storage.push(user)
        return storage
    }
    if (ifEqual) return storage

    //console.log(storage)
}

const findAdmin = (name)=>{
    const admins = storage.filter(user=>user.name === name)
    // console.log(admins)
    if (admins.length) return admins
    if (!admins.length) return []
}

const removeUser = (id)=>{
    const i = storage.findIndex((user)=>user.id === id)

    if (i !== -1) {
        const deleted = storage.splice(i, 1)[0]
        deletedList.push(deleted)
        return deleted
    }
}

const usersList = ()=>{
    //console.log(storage)
    return storage
}

const deletedUsers = ()=>{
    return deletedList
}

const structureStack = (arr=[], room='')=>{
    if (arr.length && room){
        return  arr.map(item=> item[room])
    } else {
        return arr
    }
}

const usersInComments = (comments=[])=>{
    // console.log(comments)
    const retrieveArr = comments.map(item => String(item.user).trim().toLowerCase())
    // console.log(retrieveArr)
    return  retrieveArr.filter((item, i)=>{
        return retrieveArr.indexOf(item) === i
    })
}

module.exports = {
    addUser, removeUser, structureStack, usersInComments, findAdmin, usersList, deletedUsers
}