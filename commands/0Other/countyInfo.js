import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: 'لوغو',
  author: 'Vex_Kshitiz',
  role: 0,
  description: 'Create designs based on input text and design number.',

  execute: async function ({ api, event, args }) {
    try {
      const searchQuery = args.join(" ");
      if (!searchQuery.includes("-")) {
        return api.sendMessage(`Invalid format. Example: {p}ephoto text -1`, event.threadID, event.messageID);
      }

      const [text, num] = searchQuery.split("-").map(str => str.trim());
      const number = parseInt(num);

      if (isNaN(number) || number <= 0 || number > 1000) {
        return api.sendMessage(" ⚠️ | قم بإدخال الأمر هكذا *تصميم نص - رقم التصميم لديك من 1 إلى 6 قم بإدخل النص بالانجليزي .", event.threadID, event.messageID);
      }

      const apiUrl = `https://e-photo.vercel.app/kshitiz?text=${encodeURIComponent(text)}&number=${number}`;
      const response = await axios.get(apiUrl);
      const imageData = response.data.result;

      if (!imageData || !imageData.status || !imageData.ing) {
        return api.sendMessage(`⚡ | آسفة لم يتم صنع تصميمك بالنسبة للنص "${text}".`, event.threadID, event.messageID);
      }

      const imageUrl = imageData.ing;
      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      const imgPath = path.join(process.cwd(), 'cache', 'ephoto.jpg');
      await fs.outputFile(imgPath, imgResponse.data);

      const stream = fs.createReadStream(imgPath);
      api.setMessageReaction('🌟', event.messageID, (err) => {}, true);

      await api.sendMessage({
        attachment: stream,
        body: ''
      }, event.threadID, event.messageID);

      await fs.unlink(imgPath);
    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred.`, event.threadID, event.messageID);
    }
  }
};
