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
      const numberSearch = 9; // تحديد عدد الصور ليكون 9 تلقائيًا

      const apiUrl = `https://c-v1.onrender.com/api/pint?search=${encodeURIComponent(keySearch)}&count=${numberSearch}`;

      const res = await axios.get(apiUrl);
      const data = res.data.images;
      const imgData = [];

      for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
        const imgResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);

        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        attachment: imgData,
        body: `تم العثور على ${imgData.length} صور لكلمة البحث: ${args.join(' ')}`,
      }, event.threadID, event.messageID);

      api.setMessageReaction('✅', event.messageID, (err) => {}, true);

      await fs.remove(path.join(process.cwd(), 'cache'));
    } catch (error) {
      console.error(error);
      return api.sendMessage('حدث خطأ أثناء محاولة جلب الصور.', event.threadID, event.messageID);
    }
  },
};
