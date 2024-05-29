import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment-timezone';

export default {
  name: "ارسمي2",
  author: "kaguya project",
  role: "member",
  description: "توليد صورة بناءً على الوصف والموديل المقدم.",
  async execute({ event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const baseUrl = "https://prodia-kshitiz.onrender.com/gen";
      const apiKey = "32c2d71f-1820-4103-a7c6-4a8f5845a951"; // أدخل مفتاح API الخاص بك هنا

      // تحويل النص من العربية إلى الإنجليزية إن لزم الأمر
      const prompt = await translateToEnglish(args.join(" ").split("|")[0].trim());
      let model_id = args.join(" ").split("|")[1]?.trim();

      if (!prompt || !model_id) {
        return api.sendMessage("❌ | خطأ في الإستعمال أكتب ارسمي وصفك» | «رقم الموديل »\n ⚠️ | ملاحظة : يمكنك استخدام من 1 إلى 56 موديل ", event.threadID, event.messageID);
      }

      const startTime = Date.now();

      // طلب الصورة من الخدمة
      const apiResponse = await axios.get(baseUrl, {
        params: {
          prompt: prompt,
          model: model_id,
          key: apiKey
        }
      });

      const endTime = Date.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(2); // وقت التنفيذ بالثواني
      const timeString = moment.tz(endTime, "Africa/Casablanca").format("HH:mm:ss");
      const dateString = moment.tz(endTime, "Africa/Casablanca").format("YYYY-MM-DD");

      // التحقق من وجود رابط للصورة في الرد
      if (apiResponse.data.transformedImageUrl) {
        const imageUrl = apiResponse.data.transformedImageUrl;
        const cacheFolderPath = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheFolderPath)) {
          fs.mkdirSync(cacheFolderPath);
        }
        const imagePath = path.join(cacheFolderPath, `prodia_${Date.now()}.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
        const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
        imageStream.on("finish", () => {
          const stream = fs.createReadStream(imagePath);

api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        api.sendMessage({
    body: `✅━❪𝒈𝒆𝒏𝒆𝒓𝒂𝒕𝒆𝒅 𝒔𝒖𝒄𝒄𝒆𝒔𝒔𝒇𝒖𝒍𝒍𝒚❫━✅\n\n⌬︙𝒆𝒙𝒆𝒄𝒖𝒕𝒊𝒐𝒏 𝒕𝒊𝒎𝒆  ➭ 『${executionTime}』\n⌬︙𝖙𝖎𝖒𝖊 ➭ 『${timeString}』\n⌬︙𝖉𝖆𝖙𝖊 ➭ 『${dateString}』`,
            attachment: stream
          }, event.threadID, event.messageID);
        });
      } else {
        throw new Error("رابط الصورة غير موجود.");
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | حدث خطأ. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};

async function translateToEnglish(text) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    return translationResponse?.data?.[0]?.[0]?.[0];
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // إرجاع النص كما هو في حالة وجود خطأ في الترجمة
  }
}