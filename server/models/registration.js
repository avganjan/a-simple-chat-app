const mongoose = require('mongoose')

const loginSchema = mongoose.Schema(
    {
        __v: Number,
        createdAt: String,
        log_pass: [Object]
    }
)

const Registration = mongoose.model('Registration', loginSchema)

module.exports = Registration