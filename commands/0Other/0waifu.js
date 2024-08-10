import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "زوجة",
  author: "YourName",
  role: "member",
  description: "أحضر صورة أنمي عشوائية.",

  async execute({ api, event }) {
    const categories = [
      'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 
      'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 
      'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 
      'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'
    ];

    // اختيار فئة عشوائية
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${randomCategory}`);
      const imgUrl = res.data.url;

      if (imgUrl) {
        const imagePath = path.join(process.cwd(), 'cache', `${Date.now()}_${randomCategory}.png`);
        const writer = fs.createWriteStream(imagePath);
        const response = await axios({
          url: imgUrl,
          method: 'GET',
          responseType: 'stream'
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
          api.setMessageReaction("😘", event.messageID, (err) => {}, true);
  
          api.sendMessage({
            body: `࿇ ══━━━✥◈✥━━━══ ࿇\n\t\t\t\t💜☟  ω𝒶ⓘғυ  ☟💜\n\t\t\t\t${randomCategory}\n࿇ ══━━━✥◈✥━━━══ ࿇`,
            attachment: fs.createReadStream(imagePath)
          }, event.threadID, () => fs.unlinkSync(imagePath));
        });

        writer.on('error', (err) => {
          console.error('Error writing file:', err);
          api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
        });
      } else {
        api.sendMessage('❓ | لم يتم العثور على صورة.', event.threadID, event.messageID);
      }
    } catch (e) {
      console.error('Error fetching image:', e);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
    }
  }
};
