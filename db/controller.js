const UserModel = require('./userModel')
const WordModel = require('./wordModel')

async function createUser(chatId) {
    try {
        const user = await UserModel.create({chatId, "answers": 0, "attempts": 0})
        console.log('New User added succesfully!')
        return user
    } 
    catch(err) {
        console.log('createUser went wrong')
        return null
    }
}

async function getUser(chatId) {
    try {
        const user = await UserModel.findOne({chatId})
        if(!user) return await createUser(chatId)
        return user
    } 
    catch(err) {
        console.log('getUser went wrong')
        return null
    }
}

async function switchMode(chatId) {
    try {
        const user = await UserModel.findOne({chatId})
        if(!user) return await createUser(chatId)
        user.randomMode = !user.randomMode
        return user.save()
    } 
    catch(err) {
        console.log('switchMode went wrong')
        return null
    }
}

async function setSection(chatId, section) {
    try {
        const user = await UserModel.findOne({chatId})
        if(!user) return await createUser(chatId)
        user.currentSection = section
        return user.save()
    } 
    catch(err) {
        console.log('setSection went wrong')
        return null
    }
}

async function getRandomWord() {
    try {
        //const word = await WordModel.aggregate([{$match: {_id: { $nin: [...hiddenWords]}}}, {$sample: {size: 1}}])
        const word = await WordModel.aggregate([{$sample: {size: 1}}])
        return word[0]
    } 
    catch(err) {
        console.log('getRandomWord went wrong')
        return null
    }
}

async function getNextWord(section, index) {
    try { 
        const word = await WordModel.findOne({section, index})
        if(!word) return await WordModel.findOne({section, index: 1})
        return word
    } 
    catch(err) {
        console.log('getNextWord went wrong')
        return null
    }
}

async function addAnswer(chatId) {
    try {
        if(!getUser(chatId)) await createUser(chatId)
        const user = await UserModel.findOne({chatId})
        user.answers++
        return await user.save()
    } 
    catch(err) {
        return console.log('addAnswer went wrong')
    }
}

async function getAnswers(chatId) {
    try {
        if(!getUser(chatId)) await createUser(chatId)
        const user = await UserModel.findOne({chatId})
        return user.answers
    } 
    catch(err) {
        console.log('getAnswers went wrong')
        return null
    }
}

module.exports = {createUser, switchMode, setSection, 
                    getRandomWord, getNextWord, getUser, addAnswer, getAnswers}