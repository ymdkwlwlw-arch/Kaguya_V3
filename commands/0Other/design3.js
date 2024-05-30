import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { cwd } from 'process';

export default {
  name: "تصميم3",
  version: "1.0.0",
  author: "kaguya project",
  description: "قم بإنشاء تصميم بإسمك الشخصي والعائلي",
  role: "member",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const info = event.body.slice(event.body.indexOf(' ') + 1);
    if (!info) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال الأمر بهذه الصيغة :\nتصميم3 [الإسم الشخصي | الإسم العائلي]", event.threadID, event.messageID);
    }

    const [text, text1] = info.split("|").map((item) => item.trim());
    if (!text || !text1) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال كل من الإسم الشخصي والعائلي.", event.threadID, event.messageID);
    }

    await api.sendMessage("⏱️ | جاري معالجة طلبك يرجى الإنتظار...", event.threadID, event.messageID);

    const imgURL = `https://tanjiro-api.onrender.com/gfx3?text=${encodeURIComponent(text)}&text2=${encodeURIComponent(text1)}&api_key=tanjiro`;

    try {
      const response = await axios.get(imgURL, { responseType: 'arraybuffer' });
      const imagePath = path.join(cwd(), 'cache', 'design_image.jpg');
      await fs.outputFile(imagePath, response.data);

      const form = {
        body: "✅ | تم الإنتهاء من التصميم",
        attachment: fs.createReadStream(imagePath)
      };

      await api.sendMessage(form, event.threadID, event.messageID);

      await fs.unlink(imagePath);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك", event.threadID, event.messageID);
    }
  }
};