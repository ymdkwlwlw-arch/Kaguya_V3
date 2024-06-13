import axios from "axios";
import fs from "fs";
import path from "path";
import request from "request";

const currentDir = process.cwd();

export default {
  name: "إزالة_الخلفية",
  author: "حسين يعقوبي",
  role: "member",
  description: "يقوم بإزالة الخلفية من الصورة المُرسلة.",
  cooldown: 60, // cooldown بالثواني

  async execute({ api, event }) {
    const { threadID, messageID, type, messageReply } = event; // تم التصحيح هنا

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    if (type !== 'message_reply') {
      api.sendMessage('[❌] إستخدام غير صالح المرجو الرد على صورة.', threadID, messageID);
      return;
    }

    if (messageReply.attachments.length !== 1 || messageReply.attachments[0].type !== 'photo') {
      api.sendMessage('[❌] صورة غير صالحة ، المرجو الرد على صورة واحدة وواضحة المرة المقبلة.', threadID, messageID);
      return;
    }

    const url = messageReply.attachments[0].url;
    const inputPath = path.join(currentDir, 'cache', `removebg.png`);

    request(url)
      .pipe(fs.createWriteStream(inputPath))
      .on('finish', () => {
        const apiUrl = `https://for-devs.onrender.com/api/rbg?imageUrl=${encodeURIComponent(url)}&apikey=api1`;

        axios({
          method: 'get',
          url: apiUrl,
          responseType: 'arraybuffer',
        })
          .then((res) => {
            if (res.status !== 200) {
              console.error('Error:', res.status, res.statusText);
              return;
            }

            fs.writeFileSync(inputPath, res.data);

            api.setMessageReaction("✅", event.messageID, (err) => {}, true);

            const message = {
              body: ' ✅ | تم بنجاح إزالة الخلفية.',
              attachment: fs.createReadStream(inputPath),
            };

            api.sendMessage(message, threadID, messageID);
          })
          .catch((error) => {
            api.sendMessage('[❌] فشل الطلب \n\n' + error, threadID, messageID);
            console.error('Request failed:', error);
          });
      });
  },
};
