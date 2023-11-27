const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('6560695478:AAERcN9NFdPG8BYG1t_PAn36tbG6cPKGuOI');


async function sendToChannel(channelId, message) {
  try {
    await bot.telegram.sendMessage(channelId, message);
    console.log('Mesaj kanala gönderildi:', message);
  } catch (error) {
    console.error('Kanala mesaj gönderilirken bir hata oluştu:', error);
  }
}



bot.use((ctx, next) => {
  ctx.session = ctx.session || {};
  return next();
});

// Kelimelerin kaydedileceği dosya yolları
const wordsFile = 'kelimeler.json';
// Kullanıcı verilerini içerecek dosya
const usersFile = 'users.json';

      
// Kullanıcıların dil tercihlerini saklamak için bir nesne oluştur
const userLanguages = {};
let userStats = loadUserStats();


// Dil dosyalarını yükle
const languageFiles = {
  az: require("./languages/az"),
  tr: require("./languages/tr"),
};


// Kullanıcının dil tercihini kaydetmek için bir işlev
function setUserLanguage(userId, languageCode) {
  userLanguages[userId] = languageCode;
  fs.writeFileSync("userLang.json", JSON.stringify(userLanguages), "utf-8");
}


// İstifadecilerin dil secimini almaq ucun function
function getUserLanguage(userId) {
  return userLanguages[userId] || "az"; // Varsayılan olarak Azerbaycanca
}


// İstifadəçi statistikalarını yüklə
function loadUserStats() {
  try {
    const data = fs.readFileSync("userStats.json", "utf8");
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
}

// İstifadəçi statistikalarını yadda saxla
function saveUserStats(stats) {
  fs.writeFileSync("userStats.json", JSON.stringify(stats), "utf8");
}

// Dil değiştirme komutu
bot.command("start", (ctx) => {
  const userId = ctx.from.id;
  const language = getUserLanguage(userId);

  ctx.reply(languageFiles[language].setLang, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇦🇿 Azərbaycan", callback_data: "az" }],
        [{ text: "🇹🇷 Türkçe", callback_data: "tr" }]
      ],
    },
  });
});

bot.command('soz', async (ctx) => {
  const userId = ctx.from.id;
  const language = getUserLanguage(userId);
  let channelId = -1002016371487; // Kanal ID'sini buraya girin

  const messageText = ctx.message.text.split('/soz ')[1]; // Kullanıcının mesajını al
  if (!messageText) {
    ctx.replyWithHTML(languageFiles[language].Sozerr);
    return;
  }

  try {
    await bot.telegram.sendMessage(channelId, messageText); // Mesajı kanala gönder
    ctx.replyWithHTML(languageFiles[language].SozOkey);
  } catch (error) {
    console.error('Mesaj gönderilirken bir hata oluştu:', error);
    ctx.reply(`errr`);
  }
});


// Kullanıcı verilerini al
let users = {};
if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

// /stats komutu - Kullanıcılara özel istatistikleri gösterme
bot.command('stats', (ctx) => {
  const userId = ctx.message.from.id.toString();
  const language = getUserLanguage(userId);

  // Kullanıcıyı kaydet
  addUser(userId);

  // İstatistikleri göster
  const totalUsers = Object.keys(users).length;
  let totalMessagesSent = 0;
  Object.keys(users).forEach((user) => {
    totalMessagesSent += users[user].messagesSent;
  });

  // return ctx.replyWithHTML(`Istifadəçilər: ${totalUsers}`);
  return ctx.replyWithHTML(languageFiles[language].stats
    .replace("{stats}", totalUsers));
});

// Kullanıcı ekleme fonksiyonu
function addUser(userId) {
  if (!users[userId]) {
    users[userId] = { messagesSent: 0 };
    saveUsers();
  }
}

// Kullanıcıları dosyaya kaydetme fonksiyonu
function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}




// Dil değiştirme komutu
bot.command("lang", (ctx) => {
  const userId = ctx.from.id;
  const language = getUserLanguage(userId);

  ctx.reply(languageFiles[language].setLang, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇦🇿 Azərbaycan", callback_data: "az" }],
        [{ text: "🇹🇷 Türkçe", callback_data: "tr" }],
      ],
    },
  });
});


// Dil değiştirme işlemi
bot.action(/^(tr|az)$/, (ctx) => {
  const newLanguage = ctx.match[0];
  const userId = ctx.from.id;
  const language = getUserLanguage(userId);

  setUserLanguage(userId, newLanguage);

  // ctx.editMessageText(languageFiles[newLanguage].languageChanged);
  ctx.editMessageText(languageFiles[newLanguage].languageChanged, {
    parse_mode:'HTML',
    reply_markup:{
        inline_keyboard:[
                [{
                    text:languageFiles[language].helpbtn, callback_data:'help'
                }]
            ]
    }

    });
});


bot.action('help', ctx=>{
  const userId = ctx.from.id;
  const language = getUserLanguage(userId);

  ctx.editMessageText(languageFiles[language].help)
})


bot.on('text', async (ctx) => {
    const message = ctx.message.text.toLowerCase();
    const words = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));
    const userId = ctx.from.id;
    const language = getUserLanguage(userId);
    
    // Özel komutları burada kontrol edebilirsiniz
    if (ctx.message.text && ctx.message.text.startsWith('/')) {
        // Özel komutlara özel işlemler yapabilirsiniz
        // Örneğin, '/komut' gibi bir şey yazıldığında yapılacak işlemler
        return;
    }

    // Grup içinde mesajları iletmek için
    const text = ctx.message.text;
    const username = ctx.from.username ? `@${ctx.from.username}` : '';
    const formattedMessage = `<b><a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>:</b> ${text}`;

    bot.telegram.sendMessage(-4015406535, formattedMessage, { parse_mode: 'HTML' });

    // Özel komutları burada kontrol edebilirsiniz
    if (message.startsWith('/bot ')) {
        const splitMessage = message.split(' - ');
        const wordToLearn = splitMessage[0].split('/bot ')[1];
        const meaning = splitMessage[1];

        if (!wordToLearn || !meaning) {
            return ctx.replyWithHTML(languageFiles[language].ERRCMD);
        }

        if (!words[wordToLearn]) {
            words[wordToLearn] = meaning;
            fs.writeFileSync(wordsFile, JSON.stringify(words));

            const channelId = -1002016371487; // Kanalın kullanıcı adını veya ID'sini girin
            const messageToSend = `Yeni söz:\n ${wordToLearn} - ${meaning}`;
            sendToChannel(channelId, messageToSend);

            return ctx.replyWithHTML(languageFiles[language].twk);
        } else {
            return ctx.replyWithHTML(languageFiles[language].dmz);
        }
    } else {
        if (words[message]) {
            return ctx.reply(words[message]);
        } else {
  if (ctx.chat.type === "private") {
            return ctx.replyWithHTML(languageFiles[language].orr);
          } else {

          }
        }
    }


});




bot.launch();
