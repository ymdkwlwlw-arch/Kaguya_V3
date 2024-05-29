import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import request from 'request';

export default {
  name: "شوتي",
  author: "kaguya project",
  role: "member",
  description: "تحميل فيديوهات من TikTok باستخدام شوتي API.",
  async execute({ message, args, api, event }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const apiUrl = "https://shoti-srv1.onrender.com/api/v1/get";

      const { data } = await axios.post(apiUrl, {
        apikey: "$shoti-1ho3b41uiohngdbrgk8",
      });

      const { url: videoUrl, user: { username, nickname } } = data.data;


      const cacheFolderPath = path.join(process.cwd(), "/cache");

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const videoPath = path.join(cacheFolderPath, 'shoti.mp4');
      const videoStream = fs.createWriteStream(videoPath);

      await new Promise((resolve, reject) => {
        const rqs = request(encodeURI(videoUrl));
        rqs.pipe(videoStream);
        rqs.on('end', resolve);
        rqs.on('error', reject);
      });

      const msg1 = {
        body: `✅ | تم تحميل مقطع شوتي بنجاح \n 👥 اسم المستخدم : ${username} \n👤 اللقب : ${nickname}`,
        attachment: fs.createReadStream(videoPath)
      };

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.sendMessage(msg1, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage(`❌ | An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  }
};