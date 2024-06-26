import axios from "axios";
import fs from "fs";
import path from "path";
import request from "request";

const currentDir = process.cwd();

export default {
  name: "جودة",
  author: "حسين يعقوبي",
  role: "member",
  description: "يقوم ب رفع جودة الصورة اللتي تم الرد عليها او المراد تحسين جود.",
  cooldown: 60, // cooldown بالثواني

  async execute({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    if (type !== 'message_reply') {
      api.sendMessage('[❕] إستخدام غير صالح المرجو الرد على صورة.', threadID, messageID);
      return;
    }

    if (messageReply.attachments.length !== 1 || messageReply.attachments[0].type !== 'photo') {
      api.sendMessage('[❕] صورة غير صالحة ، المرجو الرد على صورة واحدة وواضحة المرة المقبلة.', threadID, messageID);
      return;
    }

    const url = messageReply.attachments[0].url;
    const inputPath = path.join(currentDir, 'cache', `upscalate.jpg`);

    request(url)
      .pipe(fs.createWriteStream(inputPath))
      .on('finish', () => {
        const apiUrl = `https://jonellccprojectapis10.adaptable.app/api/remini?imageUrl=${encodeURIComponent(url)}`;

        axios({
          method: 'get',
          url: apiUrl,
          responseType: 'json',
        })
          .then((res) => {
            if (res.status !== 200 || !res.data.image_data || !res.data.image_size) {
              console.error('Error:', res.status, res.statusText);
              return;
            }

            const enhancedImageUrl = res.data.image_data;
            const imageSize = res.data.image_size;
            const outputPath = path.join(currentDir, 'cache', 'enhanced.jpg');

            request(enhancedImageUrl)
              .pipe(fs.createWriteStream(outputPath))
              .on('finish', () => {
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);

                const message = {
                  body: `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم رفع جودة الصورة بنجاح \n 📥 | حجم الصورة : ${imageSize}\n╼╾─────⊹⊱⊰⊹─────╼╾`,
                  attachment: fs.createReadStream(outputPath),
                };

                api.sendMessage(message, threadID, messageID);

                // إزالة الملف المؤقت بعد إرساله
                fs.unlinkSync(outputPath);
              });
          })
          .catch((error) => {
            api.sendMessage('[❌] فشل الطلب \n\n' + error, threadID, messageID);
            console.error('Request failed:', error);
          });
      });
  },
};
