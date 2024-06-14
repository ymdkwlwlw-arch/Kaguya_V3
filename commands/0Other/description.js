import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "إيموجي",
  author: "kaguya project",
  role: "member",
  description: "تحويل إيموجي الى صورة متحركة",
  async execute({ message, args, api, event }) {
    if (args.length === 0) {
      api.sendMessage("⚠️ | يرجى إدخال إيموجي لتحويله إلى صورة متحركة.", event.threadID, event.messageID);
      return;
    }

    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const prompt = args.join(" ");

      // Translate Arabic text to English if needed
      const emiApiUrl = `https://deku-rest-api-ywad.onrender.com/emoji2gif?q=${encodeURIComponent(prompt)}`;
      const startTime = Date.now();

      const emiResponse = await axios.get(emiApiUrl, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(process.cwd(), "/cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}imojie.gif`);
      fs.writeFileSync(imagePath, Buffer.from(emiResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      api.sendMessage({
        body: `✅❪تــم الــتــحــويــل بــنــجــاح❫✅`,
        attachment: stream
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | حدث خطأ أثناء تحويل الإيموجي إلى صورة متحركة.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  }
};
