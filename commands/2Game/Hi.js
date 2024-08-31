import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  aliases:["قل"],
  description: "تحويل النص إلى كلام بواسطة خدمة Google Text-to-Speech.",
  execute: async ({ api, message, args, event }) => {
    let say = args.join(" ");
    let url = `https://www.noobs-api.000.pe/dipto/text2voiceV2?text=${encodeURIComponent(say)}&format=mp3&voiceModel=Nova`;

    try {
      // طلب من API والحصول على ملف الصوت
      const response = await axios.get(url);
      const audioUrl = response.data.voiceUrl;

      // تنزيل الملف الصوتي من الرابط
      const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
      const audioPath = path.join(process.cwd(), "cache", "audio.mp3");
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      // إرسال الملف الصوتي
      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // حذف الملف المؤقت بعد إرساله
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(error);
      await api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
    }
  }
};
