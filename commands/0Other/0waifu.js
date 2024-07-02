import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "زوجة",
  author: "kaguya project",
  role: "member",
  description: "Fetches and sends a waifu image.",
  
  execute: async function ({ api, event, args }) {
    const name = args.join(" ");
    const downloadDirectory = process.cwd();
    
    async function downloadImage(url, filePath) {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);

      return new Promise((resolve, reject) => {
        fileStream.on('finish', () => resolve(filePath));
        fileStream.on('error', reject);
      });
    }

    if (!name) {
      try {
        let res = await axios.get('https://smfahim.onrender.com/waifu');
        let img = res.data.url;

        const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);
        await downloadImage(img, filePath);
        api.setMessageReaction("😘", event.messageID, (err) => {}, true);

        const form = {
          body: `࿇ ══━━━━✥◈✥━━━━══ ࿇\n   「 𝔀𝓪𝓲𝓯𝓾 」   \n࿇ ══━━━━✥◈✥━━━━══ ࿇`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(form, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      } catch (e) {
        api.sendMessage('Not Found', event.threadID, event.messageID);
      }
    } else {
      try {
        let res = await axios.get(`https://smfahim.onrender.com/waifu/${name}`);
        let img1 = res.data.url;

        const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);
        await downloadImage(img1, filePath);
        api.setMessageReaction("😘", event.messageID, (err) => {}, true);

        const form = {
          body: `◆❯━━━━━━▣✦▣━━━━━━━❮◆\n   「 𝔀𝓪𝓲𝓯𝓾 」   \n◆❯━━━━━━▣✦▣━━━━━━━❮◆`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(form, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      } catch (e) {
        api.sendMessage('No waifu category: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe', event.threadID, event.messageID);
      }
    }
  }
};
