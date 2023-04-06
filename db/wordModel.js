const mongoose = require('mongoose')

const WordSchema = new mongoose.Schema({
    section: {type: String, required: true},
    index: {type: Number},
    german: {type: String, unique: true},
    russian: {type: String},
})

module.exports = mongoose.model('words', WordSchema)