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

      const url = event.body;
      const response = await axios.get(`https://samirxpikachu.onrender.com/tiktok?url=${encodeURIComponent(url)}`);

      if (response.data.url) {
        const videoUrl = response.data.url;
        const username = response.data.user.nickname;
        const duration = response.data.duration;

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
          const fileSize = (await fs.stat(filePath)).size / (1024 * 1024); // in MB
          if (fileSize > 25) {
            api.sendMessage("الملف كبير جدًا، لا يمكن إرساله", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
          } else {
            const messageBody = `࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ | تــم تــحــمــيــل الــمــقــطــع\n👤 | المستخدم: ${username}\n⏱️ | المدة: ${duration} ثانية\n࿇ ══━━━━✥◈✥━━━━══ ࿇`;

            api.setMessageReaction("✅", event.messageID, (err) => {}, true);

            api.sendMessage({
              body: messageBody,
              attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
          }
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
