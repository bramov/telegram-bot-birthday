const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const token = process.env.TELEGRAM_KEY;
const { greetingByName, greetingWithoutName } = require('./utils/text')


const bot = new TelegramBot(token, { polling: true });
mongoose.connect(
  process.env.MONGO_KEY,
  {useNewUrlParser: true, useUnifiedTopology: true}
  );


bot.on('new_chat_members', (msg) => {
  const id = msg.chat.id;
  let response = '';

  if (msg.new_chat_participant.first_name) {
    response = greetingByName(msg.new_chat_participant.first_name)
  } else {
    response = greetingWithoutName();
  }

  bot.sendMessage(id, response);
})

// bot.sendMessage(-534616419, 'тестовое сообщение в чат с айди -534616419')
cron.schedule('0 9 * * *', async () => {
  const date = new Date();
  const user = await User.findOne({
    day: date.getDate() + '',
    month: (date.getMonth() + 1) + ''
  })
  console.log(date.getDate() + '');
  console.log((date.getMonth() + 1) + '');
  console.log(user);
  if (user) {
    bot.sendMessage(-510092083, `Сегодня день рождения у пользователя ${user.name}! От всего чата желаем ему здоровья!`)
  } else {
    bot.sendMessage(-510092083, 'Сегодня ни у кого нет др');
  }
  //bot.sendMessage(-510092083, 'сейчас ТЕСТ утра и я делаю проверку др');
})
