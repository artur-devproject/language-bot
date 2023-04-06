const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    chatId: {type: Number, required: true, unique: true},
    answers: {type: Number, default: 0},
    randomMode: {type: Boolean, default: false},
    currentSection: {type: String, default: ''},
})

module.exports = mongoose.model('users', UserSchema)