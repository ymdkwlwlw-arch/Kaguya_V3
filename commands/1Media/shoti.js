import axios from "axios";
import fs from "fs";
import path from "path";

export default {
  name: "تحميل",
  author: "Kaguya Project",
  role: "member",
  description: "تنزيل مقطع فيديو من Facebook.",
  execute: async function({ api, event, args }) {

    api.setMessageReaction("⬇️", event.messageID, null, true);

    try {
      const link = args.join(" ");
      if (!link) {
        api.sendMessage(`⚠️ | يرجى إدخال رابط أولاً لمتابعة تنزيل الفيديو، مثال: *تحميل «رابط اي موقع اواصل احتماعي»`, event.threadID);
        return;
      }

      // إرسال رسالة للإنتظار
      const waitingMessage = await api.sendMessage(`🕥 | جاري تحميل الفيديو. يرجى الانتظار لحظة...`, event.threadID);

      const res = await axios.get(`https://nobs-api.onrender.com/dipto/alldl?url=${encodeURIComponent(link)}`);
      const videoData = res.data;

      if (!videoData || !videoData.result) {
        api.sendMessage("⚠️ | لم أتمكن من العثور على فيديو بناءً على الرابط المقدم. يرجى المحاولة مرة أخرى.", event.threadID);
        return;
      }

      const videoUrl = Buffer.from(videoData.result, 'base64').toString('utf-8'); // فك تشفير URL الفيديو
      const videoPath = path.join(process.cwd(), "cache", `fbdl.mp4`);

      // إنشاء Stream لحفظ الفيديو
      const writer = fs.createWriteStream(videoPath);
      const videoStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      videoStream.data.pipe(writer);

      writer.on('finish', () => {
        // حذف رسالة الانتظار قبل إرسال المقطع
        api.unsendMessage(waitingMessage.messageID);

        api.setMessageReaction("✅", event.messageID, null, true);

        // إرسال المقطع مع عنوانه
        api.sendMessage(
          {
            body: `༈「تـم تـحـمـيـل الـفـيـديـو」 ✅ ༈`,
            attachment: fs.createReadStream(videoPath)
          },
          event.threadID,
          () => fs.unlinkSync(videoPath) // حذف الملف بعد الإرسال
        );

        // إعادة تعيين رمز التفاعل على الرسالة الأصلية
        api.setMessageReaction("", event.messageID, null, true);
      });

      writer.on('error', (error) => {
        api.sendMessage(`حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة مرة أخرى لاحقًا.`, event.threadID);
        console.error(error);
      });

    } catch (error) {
      api.sendMessage(`حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة مرة أخرى لاحقًا.`, event.threadID);
      console.log(error);
    }
  }
};
