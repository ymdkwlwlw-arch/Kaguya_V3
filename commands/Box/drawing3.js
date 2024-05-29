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
      api.setMessageReaction('⏱️', event.messageID, (err) => {}, true);

      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(args.join(' '))}`);
      const translatedText = translationResponse.data[0][0][0];

      const keySearch = translatedText;
      const numberSearch = 20; // تحديد عدد الصور ليكون 12 تلقائيًا

      const apiUrl = `https://turtle-apis.onrender.com/api/pinterest?search=${encodeURIComponent(keySearch)}&keysearch=${numberSearch}`;

      const res = await axios.get(apiUrl);
      const data = res.data.images;
      const imgData = [];

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);

        api.setMessageReaction('✅', event.messageID, (err) => {}, true);
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        attachment: imgData,
      }, event.threadID, event.messageID);

      await fs.remove(path.join(process.cwd(), 'cache'));
    } catch (error) {
      console.error(error);
      return api.sendMessage('حدث خطأ.', event.threadID, event.messageID);
    }
  },
};
