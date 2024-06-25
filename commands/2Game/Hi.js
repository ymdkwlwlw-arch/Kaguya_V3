import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "تحويل النص إلى كلام بواسطة خدمة Google Text-to-Speech.",
  execute: async ({ api, message, args, event }) => {
    let say = args.join(" ");

    if (!say) {
      return api.sendMessage("يرجى تقديم نص للتحويل إلى كلام.", event.threadID);
    }

    try {
      const url = `https://nobs-api.onrender.com/dipto/text2voiceV2?text=${encodeURIComponent(say)}&format=mp3&voiceModel=Nova`;
      const response = await axios.get(url);

      if (response.data && response.data.voiceUrl) {
        const audioUrl = response.data.voiceUrl;
        
        // استخدم تدفق البيانات (stream) لتنزيل الملف الصوتي وحفظه
        const fileName = `${event.senderID}.mp3`;
        const filePath = path.join(process.cwd(), "cache", fileName);
        const audioResponse = await axios.get(audioUrl, { responseType: "stream" });

        const writeStream = fs.createWriteStream(filePath);
        audioResponse.data.pipe(writeStream);

        writeStream.on("finish", async () => {
          await api.sendMessage({
            body: "",
            attachment: fs.createReadStream(filePath)
          }, event.threadID);

          // إزالة الملف المؤقت بعد إرساله
          fs.unlinkSync(filePath);
        });

        writeStream.on("error", (err) => {
          console.error("Error writing to stream:", err);
          api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
        });

      } else {
        throw new Error("لم يتم العثور على URL للصوت في الاستجابة.");
      }
    } catch (error) {
      console.error(error);
      await api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
    }
  }
};
