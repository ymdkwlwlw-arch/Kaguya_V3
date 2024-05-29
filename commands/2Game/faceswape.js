
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "صورة",
  version: "1.0.0",
  role: "member",
  author: "kaguya project",
  description: "جلب صور برو اولاد و صور برو بنات مع صور سوبرا",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const categories = {
      boy: "بروفايل اولاد",
      girl: "بروفايل بنات",
      car: "سوبرا"
    };

    if (args.length === 0) {
      const availableCategories = Object.keys(categories).join(", ");
      return api.sendMessage(`Please choose a category:\nAvailable categories: ${availableCategories}`, event.threadID, event.messageID);
    }

    const category = args[0].toLowerCase();

    if (!categories[category]) {
      return api.sendMessage(` ⚠️ | المرجو اختيار  اي من هذه : ${Object.keys(categories).join(", ")}`, event.threadID, event.messageID);
    }

    try {
      const searchQuery = categories[category];
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(searchQuery)}`);
      const translatedQuery = translationResponse?.data?.[0]?.[0]?.[0];

      const url = `https://pin-two.vercel.app/pin?search=${encodeURIComponent(translatedQuery)}`;
      const searchResponse = await axios.get(url);
      const searchResults = searchResponse.data.result;

      if (searchResults.length === 0) {
        return api.sendMessage(`No results found for category: ${category}`, event.threadID, event.messageID);
      }

      const randomIndex = Math.floor(Math.random() * searchResults.length);
      const imageUrl = searchResults[randomIndex];

      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imagePath = path.join(cwd(), 'cache', `randompic_image.jpg`);
      await fs.outputFile(imagePath, imageResponse.data);

      const imageStream = fs.createReadStream(imagePath);
      await api.sendMessage({
        body: ``,
        attachment: imageStream
      }, event.threadID, event.messageID);

      await fs.unlink(imagePath);
    } catch (error) {
      console.error(error);
      return api.sendMessage(`An error occurred while fetching the picture.`, event.threadID, event.messageID);
    }
  }
};
