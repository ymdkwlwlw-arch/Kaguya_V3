import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "تخيلي4",
  author: "kaguya project",
  role: "member",
  description: "Generates an image from a prompt.",
  
  execute: async function ({ api, event, args }) {
    const text = args.join(" ");
    
    try {
      // الترجمة من العربية إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
      const prompt = translationResponse?.data?.[0]?.[0]?.[0] || text;

      // الحصول على رابط الصورة من API
      const apiUrl = `https://samirxpikachu.onrender.com/mageDef?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      const downloadDirectory = process.cwd();
      const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.jpg`);
      
      // حفظ الصورة في المسار المؤقت
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        // إرسال الصورة كملف مرفق
        await api.sendMessage({
          body: '࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ |تم توليد الصورة بنجاح\n࿇ ══━━━━✥◈✥━━━━══ ࿇',
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });

      writer.on('error', (error) => {
        console.error("خطأ أثناء تحميل الصورة:", error);
        api.sendMessage("Failed to retrieve image.", event.threadID);
      });
      
    } catch (error) {
      console.error("خطأ أثناء معالجة الطلب:", error);
      api.sendMessage("Failed to retrieve image.", event.threadID);
    }
  }
};
