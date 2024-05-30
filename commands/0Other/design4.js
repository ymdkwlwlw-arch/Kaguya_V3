import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { cwd } from 'process';

export default {
  name: "تصميم4",
  version: "1.0.0",
  author: "kaguya project",
  description: "قم بإنشاء تصميم بإسمك الشخصي والعائلي",
  role: "member",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const info = event.body.slice(event.body.indexOf(' ') + 1);
    if (!info) {
      return api.sendMessage("⚠️ | المرجو ادخال الأمر بهذه الطريقة :\nتصميم4 [الإسم الشخصي | الإسم العائلي]", event.threadID, event.messageID);
    }

    const [text, text1] = info.split("|").map((item) => item.trim());
    if (!text || !text1) {
      return api.sendMessage("⚠️ | المرجو ادخال كل من الإسم الشخصي والإسم العائلي.", event.threadID, event.messageID);
    }

    const waitMessageID = await api.sendMessage("⏱️ | جاري معالجة طلبك المرجو الإنتظار...", event.threadID, event.messageID);

    const imgURL = `https://tanjiro-api.onrender.com/gfx4?text=${encodeURIComponent(text)}&text2=${encodeURIComponent(text1)}&api_key=tanjiro`;

    try {
      const response = await axios.get(imgURL, { responseType: 'arraybuffer' });
      const imagePath = path.join(cwd(), 'cache', 'design_image.jpg');
      await fs.outputFile(imagePath, response.data);

      const form = {
        body: "✅ | تم إنشاء التصميم بنجاح",
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