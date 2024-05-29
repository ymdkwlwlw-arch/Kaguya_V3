import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: 'تصميم',
  author: 'Your Name',
  role: 0,
  description: 'إرسال تصميم يحتوي على النص المدخل كمدخلة.',

  execute: async function ({ api, event, args }) {
    const text = args.join(' ');
    if (!text) {
      return api.sendMessage('⚠️ | الرجاء إدخال نص للتصميم.', event.threadID);
    } else {
      const imgPath = `https://tanjiro-api.onrender.com/gfx1?name=${encodeURIComponent(text)}&api_key=tanjiro`;
      try {
        const imgResponse = await axios.get(imgPath, { responseType: 'stream' });

        // حفظ التصميم في المسار المؤقت
        const tempImagePath = path.join(process.cwd(), 'cache', `design_${Date.now()}.png`);
        const writer = fs.createWriteStream(tempImagePath);
        imgResponse.data.pipe(writer);

        writer.on('finish', () => {

api.setMessageReaction("✨", event.messageID, () => {}, true);
          
          const form = {
            body: '✨ تفضل تصميمك',
            attachment: fs.createReadStream(tempImagePath)
          };
          api.sendMessage(form, event.threadID);
        });
      } catch (error) {
        console.error(error);
        api.sendMessage('❌ | حدث خطأ أثناء جلب التصميم.', event.threadID);
      }
    }
  },
};
