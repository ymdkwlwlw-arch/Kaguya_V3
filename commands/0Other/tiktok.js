import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "تيك",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "البحث عن مقاطع فيديو TikTok",
  role: "member",
  aliases: ["tiktok"],

  async execute({ api, event, args }) {
    api.setMessageReaction("🕐", event.messageID, () => {}, true);

    try {
      const query = args.join(" ");
      const apiUrl = `https://cc-project-apis-jonell-magallanes.onrender.com/api/tiktok/searchvideo?keywords=${encodeURIComponent(query)}${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      if (response.data.code === 0 && response.data.data.videos.length > 0) {
        const videoData = response.data.data.videos[0];
        const videoUrl = videoData.play;
        const videoFileName = `${videoData.video_id}.mp4`;

        const tempVideoPath = `./cache/${videoFileName}`;
        const writer = fs.createWriteStream(tempVideoPath);

        const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
        videoResponse.data.pipe(writer);

        writer.on("finish", () => {
          const videoStream = fs.createReadStream(tempVideoPath);
          const userName = videoData.author.unique_id;
          const title = videoData.title; // تحديد عنوان الفيديو من الاستجابة
          const messageBody = `💾 | العنوان : ${title} \n 👤 |إسم المستخدم : ${userName}`;
          api.sendMessage({ body: messageBody, attachment: videoStream }, event.threadID, () => {
            fs.unlinkSync(tempVideoPath);
          }, event.messageID);
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        });
      } else {
        api.sendMessage("⚠️ | لم يتم العثور على مقاطع فيديو TikTok للاستعلام المحدد.", event.threadID);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | عذرًا، حدث خطأ أثناء معالجة طلبك.", event.threadID);
    }
  }
};