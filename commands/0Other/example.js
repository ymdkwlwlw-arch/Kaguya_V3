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
      // ترجمة النص إلى الإنجليزية
      const translatedPrompt = await translateToEnglish(prompt);

      // تخزين المسارات المؤقتة للصور
      const imagePaths = [];

      // إرسال أربعة طلبات لتوليد الصور
      for (let i = 0; i < 4; i++) {
        const apiUrl = `https://www.samirxpikachu.run.place/niji?prompt=${encodeURIComponent(translatedPrompt)}&resolution=${encodeURIComponent(resolution)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(response.data, 'binary');

        // تحديد المسار لحفظ الصورة مؤقتاً
        const imagePath = path.join(process.cwd(), "cache", `${Date.now()}_generated_image_${i}.png`);
        await fs.outputFile(imagePath, imageData);
        imagePaths.push(imagePath);
      }

      // قراءة الصور المولدة وإرسالها
      const streams = imagePaths.map(imagePath => fs.createReadStream(imagePath));
      const attachments = streams.map((stream, index) => ({ stream, filename: `image_${index + 1}.png` }));
      
      // إرسال الرسالة مع الصور
      const info = await api.sendMessage({
        body: `✅ | تـم تـولـيـد أربـع صـور \n🔖 | رد بـ 1 ، 2 , 3 ، 4 مـن أجـل تـحـمـيل الصـورة الـمـحـددة`,
        attachment: attachments
      }, event.threadID, event.messageID);

      // حفظ بيانات الرد للمتابعة
      global.client.handler.reply.set(info.messageID, {
        author: event.senderID,
        type: "pick",
        name: "نيجي",
        searchResults: imagePaths,
        unsend: true
      });

    } catch (error) {
      console.error('خطأ في إرسال الصور:', error);
      api.sendMessage("❌ | حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    } finally {
      api.setMessageReaction("", event.messageID, (err) => {}, true);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) return;

    const index = parseInt(event.body.trim()) - 1;
    
    if (isNaN(index) || index < 0 || index >= searchResults.length) {
      return api.sendMessage("❌ | الرقم غير صحيح. الرجاء الرد برقم من 1 إلى 4.", event.threadID, event.messageID);
    }

    const selectedImagePath = searchResults[index];
    const stream = fs.createReadStream(selectedImagePath);

    // تقصير رابط الصورة باستخدام tinyurl
    shorten(selectedImagePath, async function (shortUrl) {
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      await api.sendMessage({
        body: `✅ | تـم تـحـمـيـل الـصـورة بـنـجـاح\n📎 | رابـط خـارجـي : ${shortUrl}`,
        attachment: stream
      }, event.threadID, event.messageID);
      
      // حذف الصور المؤقتة بعد الإرسال
      await Promise.all(searchResults.map(fs.remove));
    });
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
