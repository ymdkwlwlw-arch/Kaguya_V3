import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "تحويل النص إلى كلام بواسطة خدمة Noobs API.",
  aliases: ["قل"],
  execute: async ({ api, args, event }) => {
    if (args.length === 0) {
      // إذا لم يتم إدخال نص، أرسل رسالة تنبه المستخدم
      return api.sendMessage("يرجى إدخال نص لاقوله 😀", event.threadID);
    }

    let say = args.join(" ");

    try {
      // استخدم الرابط الجديد لتحويل النص إلى صوت
      const url = `https://www.noobs-api.000.pe/dipto/text2voiceV2?text=${encodeURIComponent(say)}&format=mp3&voiceModel=Nova`;
      const response = await axios.get(url);
      
      // الحصول على الرابط الصوتي من البيانات المستلمة
      const { voiceUrl } = response.data;

      // تحميل الملف الصوتي
      const audioResponse = await axios.get(voiceUrl, { responseType: "arraybuffer" });
      const audioPath = path.join(process.cwd(), "cache", "audio.mp3");
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // حذف الملف المؤقت بعد إرساله
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(error);
      await api.sendMessage("هذا كثير 🐸 علي لأقوله !", event.threadID);
    }
  }
};
