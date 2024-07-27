import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: 'صور',
  author: 'kaguya project',
  role: 0,
  description: 'البحث عن صور بالنص المدخل وإرسالها.',

  execute: async function ({ api, event, args }) {
    try {
      if (args.length === 0) {
        return api.sendMessage(' ❗ | يرجى إدخال شيء للبحث عنه.', event.threadID, event.messageID);
      }

      api.setMessageReaction('⏱️', event.messageID, (err) => {}, true);
      
      // ترجمة النص
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(args.join(' '))}`);
      const translatedText = translationResponse.data[0][0][0];

      // البحث عن الصور
      const apiUrl = `https://nash-api-end.onrender.com/pinterest?search=${encodeURIComponent(translatedText)}`;
      const res = await axios.get(apiUrl);
      const images = res.data.data; // تحديث هنا لاستخدام البيانات الجديدة
      const imgData = [];

      for (let i = 0; i < Math.min(9, images.length); i++) {
        const imgResponse = await axios.get(images[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);

        imgData.push(fs.createReadStream(imgPath));
      }

      api.setMessageReaction('✅', event.messageID, (err) => {}, true);
      await api.sendMessage({
        attachment: imgData,
      }, event.threadID, event.messageID);

      await fs.remove(path.join(process.cwd(), 'cache'));
      api.setMessageReaction('❌', event.messageID, (err) => {}, true);
    } catch (error) {
      console.error(error);
      api.sendMessage('حدث خطأ.', event.threadID, event.messageID);
      api.setMessageReaction('❌', event.messageID, (err) => {}, true);
    }
  },
};
