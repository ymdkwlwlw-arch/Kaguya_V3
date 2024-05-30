import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { cwd } from 'process';

export default {
  name: "تصميم5",
  version: "1.0.0",
  author: "kaguya project",
  description: "قم بإنشاء تصميم باستخدام إسمك",
  role: "member",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const text = args.join(" ");
    if (!text) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال إسمك للتصميم", event.threadID, event.messageID);
    }

    const waitMessageID = await api.sendMessage("⏱️ | جاري معالجة طلبك المرجو الإنتظار...", event.threadID, event.messageID);

    const imgURL = `https://tanjiro-api.onrender.com/gfx5?text=${encodeURIComponent(text)}&api_key=tanjiro`;

    try {
      const response = await axios.get(imgURL, { responseType: 'arraybuffer' });
      const imagePath = path.join(cwd(), 'cache', 'design_image.jpg');
      await fs.outputFile(imagePath, response.data);

      const form = {
        body: "✨ | تفضل تصميمك",
        attachment: fs.createReadStream(imagePath)
      };

      await api.sendMessage(form, event.threadID, event.messageID);

      await fs.unlink(imagePath);

      // حذف رسالة الانتظار
      await api.unsendMessage(waitMessageID.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | حدث خطأ أثناء معالجة طلبك", event.threadID, event.messageID);
    }
  }
};