const mongoose= require('mongoose')

const photoSchema = mongoose.Schema(
    {
        user: String,
        newName: String,
        oldName: String,
        filepath: String,
        fullPath: String,
        pathToDir: String

    }
)

const Photo = mongoose.model("Photo", photoSchema)

module.exports = Photo