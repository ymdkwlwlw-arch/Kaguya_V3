import fs from 'fs';
import axios from 'axios';
import path from 'path';

async function getStreamFromPath(filePath) {
  return fs.createReadStream(filePath);
}

async function translateText(text) {
  const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
  return translationResponse?.data?.[0]?.[0]?.[0];
}

async function downloadImage(url, filePath) {
  const response = await axios({
    url,
    responseType: 'stream',
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export default {
  name: "تخيلي3",
  author: "Kaguya Project",
  role: "member",
  description: "إنشاء صور بناءً على النص المُدخل.",
  execute: async function({ api, event, args }) {
    // التحقق من إدخال المستخدم
    if (!args.length) {
      return api.sendMessage('⚠️ | يرجى إدخال نص من اجل توليد الصورة', event.threadID, event.messageID);
    }
    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);
  

    // الحصول على النص المُدخل وتحويله إلى الإنجليزية
    const prompt = args.join(' ');
    const translatedPrompt = await translateText(prompt);

    // تحديد نسبة العرض إلى الارتفاع
    let ratio = '4:6';
    args.forEach((arg, index) => {
      if (arg === '--ar' && args[index + 1]) {
        ratio = args[index + 1];
      }
    });

    try {
      const apiUrl = 'https://www.samirxpikachu.place/fluxdev';
      const imageResponse = await axios.get(apiUrl, {
        params: { prompt: translatedPrompt, ratio },
        responseType: 'arraybuffer',
      });

      // حفظ الصورة في المسار
      const filePath = path.join(process.cwd(), 'cache', `generated_image_${Date.now()}.png`);
      await downloadImage(apiUrl, filePath);

      // إرسال الرسالة مع الصورة
      
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
      api.sendMessage({
        body: prompt,
        attachment: await getStreamFromPath(filePath),
      }, event.threadID, event.messageID);

      // حذف الصورة المؤقتة بعد الإرسال
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting the file:', err);
      });

    } catch (error) {
      console.error('Error:', error);
      api.sendMessage('❌ | حدث خطأ أثناء إنشاء الصورة. الرجاء المحاولة لاحقًا.', event.threadID, event.messageID);
    }
  }
};
