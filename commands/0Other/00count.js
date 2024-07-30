import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import request from 'request';

export default {
  name: "شوتي",
  author: "kaguya project",
  role: "member",
  description: "تحميل فيديوهات من TikTok باستخدام شوتي API.",

  async execute({ api, event }) {
    // Set the initial reaction to indicate that the process has started
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      // Define the API URL
      const apiUrl = "https://c-v1.onrender.com/shoti?apikey=$c-v1-7bejgsue6@iygv";

      // Fetch the data from the API
      const response = await axios.get(apiUrl);
      const { data } = response;

      if (data.code !== 200 || !data.data) {
        throw new Error('Failed to fetch video data from API.');
      }

      // Extract video information from the API response
      const { url: videoUrl, user: { username, nickname }, duration } = data.data;

      // Define the cache folder and video file path
      const cacheFolderPath = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const videoPath = path.join(cacheFolderPath, 'shoti.mp4');

      // Download the video
      const videoStream = fs.createWriteStream(videoPath);
      await new Promise((resolve, reject) => {
        const rqs = request(encodeURI(videoUrl));
        rqs.pipe(videoStream);
        rqs.on('end', resolve);
        rqs.on('error', reject);
      });

      // Prepare the message to send
      const msg1 = {
        body: `✅ | تم تحميل مقطع شوتي بنجاح\n👥 اسم المستخدم: ${username}\n👤 اللقب: ${nickname}\n⏳ المدة: ${duration}`,
        attachment: fs.createReadStream(videoPath)
      };

      // Send the success message and update the reaction
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.sendMessage(msg1, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
