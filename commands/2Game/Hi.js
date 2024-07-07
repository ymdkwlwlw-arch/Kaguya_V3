import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "تحويل النص إلى كلام بواسطة خدمة جديدة.",
  execute: async ({ api, message, args, event }) => {
    let say = args.join(" ");

    try {
      // استدعاء API الجديدة للحصول على رابط الصوت
      const url = `https://www.noobs-api.000.pe/dipto/text2voiceV2?text=${encodeURIComponent(say)}&format=mp3&voiceModel=Nova`;
      const response = await axios.get(url, { responseType: "json" });

      const voiceUrl = response.data.voiceUrl;

      // تحميل ملف الصوت من الرابط الجديد
      const audioResponse = await axios.get(voiceUrl, { responseType: "arraybuffer" });

      const audioPath = path.join(process.cwd(), "cache", "audio.mp3");
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // إزالة الملف المؤقت بعد إرساله
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(error);
      await api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
    }
  }
};
