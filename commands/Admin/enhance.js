import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import tinyurl from 'tinyurl';

export default {
  name: "جودة",
  author: "Kaguya Project",
  role: "member",
  description: "يقوم بتحسين الصور باستخدام API خارجية.",
  async execute({ message, event, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    const { type, messageReply } = event;
    const { attachments, threadID, messageID } = messageReply || {};

    if (type === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url, type: attachmentType } = attachment || {};

      if (!attachment || !["photo", "sticker"].includes(attachmentType)) {
        return api.sendMessage("❌ | الرد يجب أن يكون على صورة.", threadID, messageID);
      }

      try {
        // اختصار الرابط باستخدام tinyurl
        const shortenedUrl = await tinyurl.shorten(url);

        // طلب تحسين الصورة من الـ API
        const { data } = await axios.get(`https://king-aryanapis.onrender.com/api/4k?url=${encodeURIComponent(shortenedUrl)}`, {
          responseType: "json"
        });

        // الحصول على رابط الصورة المحسنة
        const imageUrl = data.resultUrl;
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });

        // إعداد مجلد الكاش وحفظ الصورة
        const cacheFolder = path.join(process.cwd(), "cache");
        if (!fs.existsSync(cacheFolder)) {
          fs.mkdirSync(cacheFolder, { recursive: true });
        }

        const imagePath = path.join(cacheFolder, "remi_image.png");
        fs.writeFileSync(imagePath, imageResponse.data);

        // إرسال الصورة المحسنة
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, threadID, () => {
          fs.unlinkSync(imagePath);
        }, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("❌ | حدث خطأ أثناء تحسين الصورة.", threadID, messageID);
      }
    } else {
      api.sendMessage("❌ | يرجى الرد على صورة.", threadID, messageID);
    }
  }
};
