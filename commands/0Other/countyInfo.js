import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: 'تصميم33',
  author: 'Vex_Kshitiz',
  role: 0,
  description: 'Create designs based on input text and design number.',

  execute: async function ({ api, event, args }) {
    async function checkAuthor(authorName) {
      try {
        const response = await axios.get('https://author-check.vercel.app/name');
        const apiAuthor = response.data.name;
        return apiAuthor === authorName;
      } catch (error) {
        console.error("Error checking author:", error);
        return false;
      }
    }

    const isAuthorValid = await checkAuthor(module.exports.author);
    if (!isAuthorValid) {
      await api.sendMessage("Author changer alert! This command belongs to Vex_Kshitiz.", event.threadID, event.messageID);
      return;
    }

    try {
      const searchQuery = args.join(" ");
      if (!searchQuery.includes("-")) {
        return api.sendMessage(`Invalid format. Example: {p}ephoto vex kshitiz -1`, event.threadID, event.messageID);
      }

      const [text, num] = searchQuery.split("-").map(str => str.trim());
      const number = parseInt(num);

      if (isNaN(number) || number <= 0 || number > 1000) {
        return api.sendMessage(" ⚠️ | قم بإدخال الأمر هكذا *تصميم نص - رقم التصميم لديك من 1 إلى 6 جرب أدخل النص بالانجليزي في حالة لم ينجح معك بالعربي.", event.threadID, event.messageID);
      }

      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const translatedText = translationResponse.data[0][0][0];

      const apiUrl = `https://e-photo.vercel.app/kshitiz?text=${encodeURIComponent(translatedText)}&number=${number}`;
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
