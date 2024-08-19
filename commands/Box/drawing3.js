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
      const numberSearch = 9; // تحديد عدد الصور ليكون 9

      const apiUrl = `https://c-v1.onrender.com/api/pint?search=${encodeURIComponent(keySearch)}&count=${numberSearch}`;

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.data || !data.data.length) {
        return api.sendMessage('لم يتم العثور على صور.', event.threadID, event.messageID);
      }

      const cacheDir = path.join(process.cwd(), 'cache');
      await fs.ensureDir(cacheDir); // تأكد من وجود مجلد cache

      const imgData = [];
      const imageCount = Math.min(numberSearch, data.count); // استخدم data.count لتحديد عدد الصور الفعلي

      for (let i = 0; i < imageCount; i++) {
        const imgResponse = await axios.get(data.data[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(cacheDir, `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);

        imgData.push(fs.createReadStream(imgPath));
      }

      // إرسال الرسالة النصية مع الصور كمرفقات
      await api.sendMessage({
        body: ` 🔖 | الــعــدد : ${imgData.length} \n📋 | الــبــرومــبــت : ${args.join(' ')}`,
        attachment: imgData
      }, event.threadID, (err) => {
        if (err) {
          console.error(err);
          return api.sendMessage('حدث خطأ أثناء محاولة إرسال الرسالة.', event.threadID, event.messageID);
        }

        api.setMessageReaction('✅', event.messageID, (err) => {}, true);

        // إزالة مجلد cache بعد إرسال الصور
        fs.remove(cacheDir).catch(console.error);
      });
    } catch (error) {
      console.error(error);
      return api.sendMessage('حدث خطأ أثناء محاولة جلب الصور.', event.threadID, event.messageID);
    }
  },
};
