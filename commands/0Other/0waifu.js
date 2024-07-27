import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: 'زوجة',
  author: 'Hussein',
  role: 'member',
  description: 'الحصول على صورة عشوائية لشخصية أنمي',
  async execute({ api, event }) {
    const cacheFolderPath = path.join(process.cwd(), 'cache');
    const imagePath = path.join(cacheFolderPath, 'waifu_image.png');

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const tid = event.threadID;
    const mid = event.messageID;

    try {
      const response = await axios.get('https://nash-api-end.onrender.com/waifu?search=waifu');

      if (response.data && response.data.images && response.data.images.length > 0) {
        const imageUrl = response.data.images[0].url;

        // Download the image as an arraybuffer
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // Save the image to the specified path
        await fs.outputFile(imagePath, imageBuffer);

        api.setMessageReaction('😘', event.messageID, (err) => {}, true);

        // Send the image in a message
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, tid, () => fs.unlinkSync(imagePath), mid);
      } else {
        return api.sendMessage('❌ | فشل في جلب صورة عشوائية لشخصية أنمي. يرجى المحاولة مرة أخرى.', tid, mid);
      }
    } catch (e) {
      return api.sendMessage(`❌ | حدث خطأ أثناء جلب الصورة: ${e.message}`, tid, mid);
    }
  }
};
