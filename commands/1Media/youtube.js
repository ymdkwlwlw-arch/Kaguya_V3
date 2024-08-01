import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

export default {
  name: "يوتيوب",
  author: "YourName",
  role: "member",
  aliases: ["يوتيب"],
  description: "بحث وتحميل فيديو من YouTube بناءً على عنوان.",

  async execute({ api, event, args }) {
    const searchQuery = args.join(" ");
    const apiUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(searchQuery)}`;

    if (!searchQuery) {
      return api.sendMessage("⚠️ | يرجى إدخال عنوان الفيديو.", event.threadID, event.messageID);
    }

    try {
      api.sendMessage(`🔍 | جاري البحث عن الفيديو "${searchQuery}",\n⏱️ | يرجى الانتظار...`, event.threadID, event.messageID);

      const response = await axios.get(apiUrl);
      const tracks = response.data;

      if (tracks.length > 0) {
        const topTrack = tracks[0]; // اختيار أول فيديو في النتائج
        const videoUrl = topTrack.videoUrl;
        const downloadApiUrl = `https://c-v1.onrender.com/downloader?url=${encodeURIComponent(videoUrl)}`;

        api.sendMessage("⏳ | جاري تحميل المقطع، يرجى الانتظار...", event.threadID, async (err, info) => {
          if (err) {
            console.error(err);
            api.sendMessage("🚧 | حدث خطأ أثناء إرسال الرسالة.", event.threadID);
            return;
          }

          try {
            const downloadLinkResponse = await axios.get(downloadApiUrl);
            const downloadLink = downloadLinkResponse.data.media.url;

            const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp4`);
            const writer = fs.createWriteStream(filePath);

            const response = await axios({
              url: downloadLink,
              method: 'GET',
              responseType: 'stream'
            });

            response.data.pipe(writer);

            writer.on('finish', () => {
              api.setMessageReaction("✅", info.messageID, () => {}, true);

              api.sendMessage({
                body: `❍───────────────❍\nإليك الفيديو ${topTrack.title}.\n\n📒 | العنوان: ${topTrack.title}\n📅 | تاريخ النشر: ${topTrack.publishDate}\n👀 | المشاهدات: ${topTrack.viewCount}\n👍 | الإعجابات: ${topTrack.likeCount}\n❍───────────────❍`,
                attachment: fs.createReadStream(filePath),
              }, event.threadID, () => fs.unlinkSync(filePath));
            });

            writer.on('error', (err) => {
              console.error(err);
              api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
            });
          } catch (error) {
            console.error(error);
            api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID);
          }
        });

      } else {
        api.sendMessage("❓ | آسف، لا يمكن العثور على الفيديو المطلوب.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
    }
  }
};
