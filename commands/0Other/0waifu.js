import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "زوجة",
  author: "Hussein",
  role: "member",
  description: "الحصول على صورة عشوائية لشخصية أنمي",
  async execute({ api, event }) {
    const cacheFolderPath = path.join(process.cwd(), "cache");
    const imagePath = path.join(cacheFolderPath, "waifu_image.jpg");

    if (!fs.existsSync(cacheFolderPath)) {
      fs.mkdirSync(cacheFolderPath);
    }

    const tid = event.threadID;
    const mid = event.messageID;

    try {
      const response = await axios.get("https://fahim-waifu.onrender.com/waifu");

      if (response.data && response.data.url) {
        const imageUrl = response.data.url;

        // تحميل الصورة كـ arraybuffer
        const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');

        // حفظ الصورة في المسار المحدد
        await fs.outputFile(imagePath, imageBuffer);

        api.setMessageReaction("😘", event.messageID, (err) => {}, true);

        // إرسال الصورة في رسالة
        api.sendMessage({ attachment: fs.createReadStream(imagePath) }, tid, () => fs.unlinkSync(imagePath), mid);
      } else {
        return api.sendMessage("فشل في جلب صورة عشوائية لشخصية أنمي. يرجى المحاولة مرة أخرى.", tid, mid);
      }
    } catch (e) {
      return api.sendMessage(e.message, tid, mid);
    }
  },
};
