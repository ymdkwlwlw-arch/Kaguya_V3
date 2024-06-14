import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { getStreamFromPath } from 'some-utility-module'; // قم بتعديل المسار والوحدة حسب استخدامك

export default {
  name: "جوجل",
  version: "1.0.0",
  author: "مشروع كاغويا",
  description: "بحث الصور في جوجل",
  role: "member",
  usages: "[عدد النتائج] [استعلام البحث]",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const cacheFolderPath = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    try {
      const numResults = parseInt(args[0]) || 6; // Default to 6 if no number is provided
      const query = args.slice(1).join(' ');
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const results = [];
      $('img[src^="https://"]').each(function() {
        results.push($(this).attr('src'));
      });

      const attachments = await Promise.all(results.slice(0, numResults).map(async (imgUrl, index) => {
        const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        const imgPath = path.join(cacheFolderPath, `image_${index}.jpg`);
        await fs.writeFile(imgPath, Buffer.from(imgResponse.data, 'binary'));
        return getStreamFromPath(imgPath);
      }));

      await api.sendMessage({
        body: `✅ | إليك أفضل ${numResults} صورة، نتيجة ل "${query}":`,
        attachment: attachments
      }, event.threadID, event.messageID);

      // Cleanup cache files
      results.slice(0, numResults).forEach((_, index) => {
        const imgPath = path.join(cacheFolderPath, `image_${index}.jpg`);
        fs.unlinkSync(imgPath);
      });
    } catch (error) {
      console.error(error);
      await api.sendMessage("❌ | آسف، لم أتمكن من العثور على أي نتائج.", event.threadID, event.messageID);
    }
  }
};
