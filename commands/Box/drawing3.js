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

      // البحث عن الصور
      const searchQuery = encodeURIComponent(args.join(' '));
      const apiUrl = `https://www.noobs-api.000.pe/dipto/pinterest?search=${searchQuery}&limit=9`;
      const res = await axios.get(apiUrl);
      const images = res.data.data; // استخدام البيانات الجديدة
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

      // حذف الملفات المؤقتة
      await fs.remove(path.join(process.cwd(), 'cache'));
    } catch (error) {
      console.error(error);
      api.sendMessage('حدث خطأ.', event.threadID, event.messageID);
      api.setMessageReaction('❌', event.messageID, (err) => {}, true);
    }
  },
}
