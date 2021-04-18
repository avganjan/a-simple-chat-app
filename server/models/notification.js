const mongoose = require("mongoose")

const notificationSchema = mongoose.Schema(
    {
        createdAt: String,
        notify: [Object]

    }
)

const Notifications = mongoose.model("Notifications", notificationSchema)

module.exports = Notifications