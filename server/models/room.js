const mongoose = require('mongoose')

const roomSchema = mongoose.Schema(
    {
        createdAt: String,
        room: [Object]
    }
)

const Room = mongoose.model("Room", roomSchema)

module.exports = Room