import axios from "axios";
import path from "path";
import fs from "fs-extra";

export default {
  name: "انستغرام",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو من Instagram.",

  execute: async function ({ api, event }) {
    api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

    try {
      if (!event.body || event.body.trim().length === 0) {
        api.sendMessage("⚠️ |يرجى إدخال رابط إنستغرام مثال *انستغرام : https://www.instagram.com", event.threadID);
        return;
      }

      const url = event.body;
      const response = await axios.get(`https://deku-rest-api-3ijr.onrender.com/api/instadl?url=${encodeURIComponent(url)}`);

      if (response.data.status && response.data.result) {
        const videoUrl = response.data.result;

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
            const messageBody = `✅ | تم تحميل المقطع بنجاح`;

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