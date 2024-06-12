import axios from 'axios';
import fs from 'fs';
import path from 'path';

const cacheDir = path.join(process.cwd(), 'cache');

export default {
  name: "مقطع_انمي2",
  author: "مشروع كاغويا",
  role: 0,
  description: "يجلب فيديو أنمي",
  execute: async ({ api, event }) => {
    try {
      const response = await axios.get('https://fahim-anime-video.onrender.com/video/apikey=Puti');
      const videoUrl = response.data.url;
      api.setMessageReaction("🕑", event.messageID);

      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      const videoPath = path.join(cacheDir, 'video.mp4');
      const videoStream = fs.createWriteStream(videoPath);
      videoResponse.data.pipe(videoStream);

      await new Promise((resolve, reject) => {
        videoStream.on('finish', resolve);
        videoStream.on('error', reject);
      });

      api.setMessageReaction("✅", event.messageID);
      await api.sendMessage({
        body: 'Here is your anime video:',
        attachment: fs.createReadStream(videoPath)
      }, event.threadID);

      fs.unlinkSync(videoPath);

    } catch (error) {
      console.error(error);
      await api.sendMessage('Sorry, there was an error fetching the video.', event.threadID);
      api.setMessageReaction("❌", event.messageID);
    }
  }
};
