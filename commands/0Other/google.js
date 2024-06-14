import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "تحسين",
  version: "1.0.0",
  author: "مشروع كاغويا",
  description: "رفع جودة الصور المقدمة أو المردود عليها",
  role: "member",
  usages: "[رابط الصورة | الرد على الصورة]",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const cachePath = path.join(process.cwd(), "cache", "upscalate_photo.jpg");
    const { threadID, messageID } = event;

    const photoUrl = event.messageReply ? event.messageReply.attachments[0].url : args.join(" ");

    if (!photoUrl) {
      return api.sendMessage("📸 | يرجى الرد على صورة أو تقديم عنوان URL للصورة للمعالجة والتحسين.", threadID, messageID);
    }

    try {
      await api.sendMessage("🕟 | جاري رفع جودة الصورة ، يرجى الإنتظار...", threadID, messageID);

      const response = await axios.get(`https://for-devs.onrender.com/api/upscale?imageurl=${encodeURIComponent(photoUrl)}&apikey=api1`);
      const processedImageURL = response.data.hazescale;

      const imgResponse = await axios.get(processedImageURL, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(imgResponse.data, 'binary');

      await fs.writeFile(cachePath, imgBuffer);

      await api.sendMessage({
        body: "✅ | تم رفع جودة الصورة بنجاح",
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);
    } catch (error) {
      await api.sendMessage(`Error processing image: ${error.message}`, threadID, messageID);
    }
  }
};
