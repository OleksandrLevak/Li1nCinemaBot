const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const config = require('./config');
const helpers = require('./helpers');
const kb = require('./keyboard-button');
const keyboard = require('./keyboard');
const database = require('../database.json');
const options = {
  webHook: {
    port: process.env.PORT
  }
};

const url = process.env.APP_URL || 'https://li1n-market-bot.herokuapp.com:443';
const bot = new TelegramBot(config.TOKEN, options);
bot.setWebHook(`${url}/bot${config.TOKEN}`);

mongoose.Promise = global.Promise;

mongoose.connect(config.DB_URL, {
  useMongoClient: true,
  useNewUrlParser: true,
   useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err))

require('./models/film.model');
const Film = mongoose.model('films');

//database.films.forEach(f => new Film(f).save());


bot.on('message', msg => {

  const chatId = helpers.getChatId(msg);

  switch(msg.text){
    case kb.home.films:
      bot.sendMessage(chatId, 'Оберіть жанр', {
        reply_markup: {
          keyboard: keyboard.film
        }
      });
      break;
    case kb.home.cinemas:
      break;
    case kb.home.favourite:
      break;
    case kb.film.camedy:
      sendFilmByQuery(chatId, {type: 'camedy'})
      break;
    case kb.film.random:
      sendFilmByQuery(chatId, {})
      break;
    case kb.film.action:
      sendFilmByQuery(chatId, {type: 'action'})
      break;
    case kb.back:
      bot.sendMessage(chatId, 'Що бажаєте переглянути?', {
        reply_markup: {
          keyboard: keyboard.home
        }
      });
      break;

  }

})

bot.onText(/\/start/, msg => {

    const chatId = helpers.getChatId(msg);

    const text = `Вітаю, ${msg.from.first_name}\nВиберіть команду для початку роботи!`

    bot.sendMessage(chatId, text, {
      reply_markup: {
        keyboard: keyboard.home
      }
    });
});

// ------------------------------------

function sendFilmByQuery(chatId, query){
  Film.find(query).then(films => {

    const html =  films.map((f, i) => {
      return `<b>${i + 1}</b> ${f.name} - /f${f.uuid}`
    }).join('\n');

    sendMessage(chatId, html, {
      parse_mode: 'HTML'
    })

  })
}