import axios from 'axios';
import fs from 'fs';
import path from 'path';

const cacheDir = path.join(process.cwd(), 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

export default {
  name: "ارسمي2",
  author: "ArYAN",
  role: "member",
  description: "رسم معتمدا على الانمي",
  
  execute: async ({ api, event, args }) => {
    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return api.sendMessage("⚠️ | قم بإدخال نص.", event.threadID, event.messageID);
      }
      
      // Translate the prompt from Arabic to English
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0];

      if (!translatedPrompt) {
        return api.sendMessage("⚠️ | Error translating the prompt.", event.threadID, event.messageID);
      }

      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      const startTime = new Date().getTime();
    
      const baseURL = `https://king-aryanapis.onrender.com/api/animex?prompt=${encodeURIComponent(translatedPrompt)}`;

      const response = await axios.get(baseURL, {
        responseType: 'stream'
      });

      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;

      const fileName = 'emix.png';
      const filePath = path.join(cacheDir, fileName); 

      const writerStream = fs.createWriteStream(filePath);
      response.data.pipe(writerStream);

      writerStream.on('finish', function() {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage({
          body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n✅ | تم بنجاح \n\n📝 | وصفك : ${prompt}\n⏱️ | الوقت المستغرق : ${timeTaken} ثانية\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

      writerStream.on('error', function(err) {
        console.error('Error writing file:', err);
        api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
      });

    } catch (error) {
      console.error('Error generating image:', error);
      api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
    }
  }
};
