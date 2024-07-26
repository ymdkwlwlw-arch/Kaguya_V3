import axios from "axios";
import fs from "fs/promises";
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
    const { threadID, messageID, type, messageReply } = event;

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    if (type !== 'message_reply') {
      api.sendMessage('[❌] إستخدام غير صالح المرجو الرد على صورة.', threadID, messageID);
      return;
    }

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length !== 1 || messageReply.attachments[0].type !== 'photo') {
      api.sendMessage('[❌] صورة غير صالحة، يرجى الرد على صورة واحدة وواضحة.', threadID, messageID);
      return;
    }

    const url = messageReply.attachments[0].url;
    const inputPath = path.join(currentDir, 'cache', 'removebg.png');

    try {
      // Download the image
      await new Promise((resolve, reject) => {
        request(url)
          .pipe(fs.createWriteStream(inputPath))
          .on('finish', resolve)
          .on('error', reject);
      });

      const apiUrl = `https://www.samirxpikachu.run.place/rbg?url=${encodeURIComponent(url)}`;

      // Call the API to remove the background
      const response = await axios({
        method: 'get',
        url: apiUrl,
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        console.error('Error:', response.status, response.statusText);
        api.sendMessage('[❌] فشل في إزالة الخلفية. حاول مجدداً لاحقاً.', threadID, messageID);
        return;
      }

      // Save the result image
      await fs.writeFile(inputPath, response.data);

      // Send the result
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const message = {
        body: '✅ | تم بنجاح إزالة الخلفية.',
        attachment: fs.createReadStream(inputPath),
      };

      api.sendMessage(message, threadID, messageID);

    } catch (error) {
      api.sendMessage('[❌] فشل الطلب \n\n' + error.message, threadID, messageID);
      console.error('Request failed:', error);
    }
  },
};
