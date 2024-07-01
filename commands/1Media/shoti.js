import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "تيكتوك",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو من TikTok.",

  execute: async function ({ api, event }) {
    api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

    try {
      if (!event.body || event.body.trim().length === 0) {
        api.sendMessage("⚠️ | يرجى إدخال رابط تيكتوك مثال *تيكتوك : https://vm.tiktok.com", event.threadID);
        return;
      }

      const url = event.body.trim();
      const response = await axios.get(`https://samirxpikachu.onrender.com/tiktok?url=${encodeURIComponent(url)}`);

      const videoUrl = response.data.url || response.data.wmplay || response.data.hdplay;

      if (videoUrl) {
        const downloadDirectory = process.cwd();
        const filePath = path.join(downloadDirectory, 'cache', `${Date.now()}.mp4`);

        const videoResponse = await axios({
          url: videoUrl,
          method: 'GET',
          responseType: 'stream'
        });

        const fileStream = fs.createWriteStream(filePath);
        videoResponse.data.pipe(fileStream);

        fileStream.on('finish', async () => {
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          await api.sendMessage({
            body: "࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ | تــم تــحــمــيــل الــمــقــطــع\n࿇ ══━━━━✥◈✥━━━━══ ࿇",
            attachment: fs.createReadStream(filePath)
          }, event.threadID);

          // حذف الملف بعد الإرسال
          fs.unlinkSync(filePath);
        });

        fileStream.on('error', (error) => {
          api.sendMessage("حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
          console.error("خطأ في تنزيل الفيديو:", error);
        });
      } else {
        api.sendMessage("لم يتم العثور على فيديو في الرابط المدخل.", event.threadID);
        console.error("لم يتم العثور على فيديو في الرابط المدخل");
      }
    } catch (err) {
      api.sendMessage("حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى لاحقًا.", event.threadID);
      console.error("خطأ أثناء معالجة الطلب:", err);
    }
  }
};
