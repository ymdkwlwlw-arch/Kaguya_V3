import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "لقطة",
  author: "HUSSEIN",
  role: "member",
  description: "احصل على لقطة شاشة من الموقع باستخدام رابط.",

  execute: async ({ api, event, args }) => {
    const url = args.join(" ");
    if (!url) {
      return api.sendMessage('⚠️ | أرجوك قم بإدخال رابط الموقع !', event.threadID, event.messageID);
    }

    const BASE_URL = `https://www.noobs-api.000.pe/dipto/ss?url=${encodeURIComponent(url)}`;
    const outPath = path.join(process.cwd(), 'cache', 'screenshot.jpg');

    try {
      
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
      // تنزيل الصورة وحفظها في مجلد cache
      const response = await axios.get(BASE_URL, { responseType: 'arraybuffer' });
      fs.writeFileSync(outPath, response.data);
        api.setMessageReaction("📸", event.messageID, (err) => {}, true);
  
      // إرسال الصورة كملف مرفق
      api.sendMessage({
        attachment: fs.createReadStream(outPath),
        body: ''
      }, event.threadID, () => {
        // حذف الصورة بعد إرسالها
        fs.unlinkSync(outPath);
      });

    } catch (e) {
      console.error('Error:', e.message);
      api.sendMessage('🚧 | حدث خطأ أثناء معالجة الرابط. يرجى المحاولة مرة أخرى.', event.threadID, event.messageID);
    }
  }
};
