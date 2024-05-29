import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { shorten } from 'tinyurl';

export default {
  name: "نيجي",
  author: "kaguya project",
  role: "member",
  description: "توليد صورة أنمي بناء على النص المعطى.",
  async execute({ message, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    const input = args.join(' ');
    const [prompt, resolution = '1:1'] = input.split('|').map(s => s.trim());

    if (!prompt) {
      return api.sendMessage("❌ | الرجاء إدخال النص.", event.threadID, event.messageID);
    }

    try {
      // رابط الأساسي للخدمة مع المعاملات
      const apiUrl = `https://apis-samir.onrender.com/niji?prompt=${encodeURIComponent(prompt)}&resolution=${encodeURIComponent(resolution)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary');

      // تحديد المسار لحفظ الصورة مؤقتاً
      const imagePath = path.join(process.cwd(), "cache", `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, imageData);

      // قراءة الصورة المولدة وإرسالها
      const stream = fs.createReadStream(imagePath);

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      shorten(apiUrl, async function (shortUrl) {
        await api.sendMessage({  
          body: `✅ |تــــم تـــولـــيــد الــصــورة بــنــجــاح`,
          attachment: stream
        }, event.threadID, event.messageID);
      });

    } catch (error) {
      console.error('خطأ في إرسال الصورة:', error);
      api.sendMessage("❌ | حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    } finally {
      api.setMessageReaction("", event.messageID, (err) => {}, true);
    }
  }
};

async function translateToEnglish(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error("خطأ في ترجمة النص:", error);
    return text; // إرجاع النص كما هو في حالة وجود خطأ في الترجمة
  }
} 