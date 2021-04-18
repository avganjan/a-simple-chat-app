const mongoose= require('mongoose')

const messagesSchema = mongoose.Schema(
    {
        createdAt: String,
        message: [Object]
    }
)

const Messages = mongoose.model("Messages", messagesSchema)

module.exports = Messages