import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "استيكر",
  author: "kaguya project",
  role: "member",
  description: "توليد استيكر بناءً على الوصف المقدم.",
  async execute({ event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      // تحويل النص من العربية إلى الإنجليزية إن لزم الأمر
      const prompt = await translateToEnglish(args.join(" ").trim());

      const baseUrl = "https://kshitiz-t2i-x6te.onrender.com/sdxl";
      const model_id = 39; 

      if (!prompt) {
        return api.sendMessage("❌ | الرجاء إدخال النص.", event.threadID, event.messageID);
      }

      // طلب الاستيكر من الخدمة
      const apiResponse = await axios.get(baseUrl, {
        params: {
          prompt: prompt,
          model_id: model_id
        }
      });

      // التحقق من وجود رابط للاستيكر في الرد
      if (apiResponse.data.imageUrl) {
        const imageUrl = apiResponse.data.imageUrl;
        const imagePath = path.join(process.cwd(), "cache", `sticker.png`);
        const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
        const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
        imageStream.on("finish", () => {
          const stream = fs.createReadStream(imagePath);
          
 api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          api.sendMessage({
            body: "",
            attachment: stream
          }, event.threadID, event.messageID);
        });
      } else {
        throw new Error("رابط الصورة غير موجود في الرد.");
      }
    } catch (error) {
      console.error("خطأ:", error);
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