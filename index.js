const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const db = require('./db/controller')
const connect_DB = require('./db/connect')

const bot = new TelegramBot(config.TG_TOKEN, {polling: true})
const currentWord = {}
const todaysAnswers = {}

connect_DB()

async function sendWord(chatId) {
    const message = `Чтобы продолжить, попробуйте другие команды или используйте команду /go`
    try {
        const user = await db.getUser(chatId)
        if(!user.currentSection && !user.randomMode) return await bot.sendMessage(chatId, "Выберите раздел")
        const index = !currentWord[chatId] ? 1 : currentWord[chatId].index + 1
        const word = user.randomMode 
            ? await db.getRandomWord() 
            : await db.getNextWord(user.currentSection, index)

        if(!word) return bot.sendMessage(chatId, message)
        currentWord[chatId] = word
        return bot.sendMessage(chatId, word.russian)
    } catch (error) {
        console.log(error.message)
        return bot.sendMessage(chatId, message)
    }
}

function format(text) {
    const formatted = text.replace(/\s+/g, ' ').trim().toLowerCase()
    return formatted
}

bot.setMyCommands([
    {command: '/go', description: "Запустить карусель"},
    {command: '/get', description: "Получить подсказку"},
    {command: '/show', description: "Показать реквизиты"},
    {command: '/stats', description: "Статистика"},
    {command: '/mode', description: "Переключить режим"},
    {command: '/schritte_a11', description: "Раздел Schritte Plus A.1.1"},
    {command: '/schritte_a12', description: "Раздел Schritte Plus A.1.2"},
    {command: '/norsk', description: "Раздел -Норвежский язык-"},
])

bot.on("message", async msg => {
    const text = msg.text
    const chatId = msg.chat.id
    const userName = msg.from.first_name || 'друг'

    if(text === '/start') {
        await db.createUser(chatId)
        await bot.sendMessage(chatId, `Привет, ${userName}`)
        return bot.sendMessage(chatId, `Чтобы начать, используй команду /go`)
    }

    if(text === '/stats') {
        const today = new Date().getDate()
        if(!todaysAnswers[chatId]?.[today]) {
            todaysAnswers[chatId] = {}
            todaysAnswers[chatId][today] = 0
        }
        const user = await db.getUser(chatId)
        const message = `Ответов за сегодня: ${todaysAnswers[chatId][today]}\n`
            + `Всего ответов: ${user?.answers || '?'}`
        return bot.sendMessage(chatId, message)
    }

    if(text === '/mode') {
        await db.switchMode(chatId)
        const user = await db.getUser(chatId)
        const message = user.randomMode ? "Рандомный режим ВКЛ" : "Рандомный режим ВЫКЛ"
        return await bot.sendMessage(chatId, message)
    }

    if(text === '/schritte_a11') {
        await db.setSection(chatId, "schritte_a11")
        return await bot.sendMessage(chatId, "Вы выбрали раздел Schritte Plus A.1.1")
    }

    if(text === '/schritte_a12') {
        await db.setSection(chatId, "schritte_a12")
        return await bot.sendMessage(chatId, "Вы выбрали раздел Schritte Plus A.1.2")
    }

    if(text === '/norsk') {
        await db.setSection(chatId, "norsk")
        return await bot.sendMessage(chatId, "Вы выбрали раздел -Норвежский язык-")
    }
    
    if(text === '/go') {
        return await sendWord(chatId)
    }

    if(!currentWord[chatId]) return await bot.sendMessage(chatId, `Чтобы начать, используй команду /go`)

    if(text === '/get') {
        return await bot.sendMessage(chatId, currentWord[chatId].german)
    }

    if(text === '/show') {
        const message = `Раздел: ${currentWord[chatId].section}\nПорядковый номер: ${currentWord[chatId].index}`
        return await bot.sendMessage(chatId, message)
    }

    if(format(text) == currentWord[chatId].german.toLowerCase()) {
        const today = new Date().getDate()
        if(!todaysAnswers[chatId]?.[today]) {
            todaysAnswers[chatId] = {}
            todaysAnswers[chatId][today] = 0
        }
        todaysAnswers[chatId][today]++
        await db.addAnswer(chatId)
        return await sendWord(chatId)
    }

    return bot.sendMessage(chatId, 'Нет! Попробуй еще')
})