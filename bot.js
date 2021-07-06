process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const token = process.env.TELEGRAM_KEY;
const { greetingByName, greetingWithoutName, months } = require('./utils/text')


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
});

bot.onText(/\/addbirthday/, async (msg) => {
  const message = msg.text.split(' ');
  if (message.length !== 4) {
    bot.sendMessage(msg.chat.id, 'Неверный формат, используйте /addbirthday Ivan 12 3, чтобы добавить др пользователя с ником Ivan 12 марта.');
    return;
  }
  const userExists = await User.findOne({
    name: message[1],
  });
  if (userExists) {
    bot.sendMessage(msg.chat.id, `Пользователь с ником ${userExists.name} уже существует`)
  } else {
    const person = new User({
      name: message[1],
      day: message[2],
      month: message[3],
    })
    await person.save();
    bot.sendMessage(msg.chat.id, `Сохранил др пользователя ${person.name} - ${person.day} ${months(person.month - 1)}`)
  }
});

bot.onText(/\/removebirthday/, async (msg) => {
  const message = msg.text.split(' ');
  if (message.length !== 2) {
    bot.sendMessage(msg.chat.id, 'Неверный формат, используйте /removebirthday Ivan, чтобы удалить др пользователя Ivan.');
    return;
  }
  const userExists = await User.findOne({
    name: message[1],
  })
  if (userExists) {
    await User.deleteOne({
      name: message[1],
    })
    bot.sendMessage(msg.chat.id, `Пользователь удален!`)
  } else {
    bot.sendMessage(msg.chat.id, `Пользователь с ником ${message[1]} не найден. Проверьте правильность написания ника.`)
  }
})


cron.schedule('0 10 * * *', async () => {

  const date = new Date();
  const users = await User.find({
    day: date.getDate() + '',
    month: (date.getMonth() + 1) + ''
  })

  if (users.length > 1) {
    const userNicknames = users.map(el => el.name).join(', ');
    bot.sendMessage(-521270190, `Сегодня день рождения у пользователей ${userNicknames}. Группа PACKINFO поздравляет Вас!`)
  } else if (users.length === 1 && users[0].name) {
    bot.sendMessage(-521270190, `Сегодня день рождения у пользователя ${users[0].name}! Группа PACKINFO поздравляет Вас!`)
  }

})
