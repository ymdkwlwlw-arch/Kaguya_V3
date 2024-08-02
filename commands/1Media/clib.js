import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default {
  name: "يوتيوب",
  author: "YourName",
  role: "member",
  aliases:["مقطع","يوتيب"],
  description: "بحث ومشاهدة النقاطع على اي لليوتيوب ",

  execute: async ({ api, event, args }) => {
    const searchQuery = encodeURIComponent(args.join(" "));
    const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;
    const chatId = event.threadID;
    const messageID = event.messageID;

    if (!searchQuery) {
      return api.sendMessage(" ⚠️ | المرجو إدخال إسم الأغنية", chatId, messageID);
    }

    try {
      api.sendMessage("🔍 | جاري البحث عن المقطع ، يرجى الإنتظار.....", chatId, messageID);

      const response = await axios.get(apiUrl);
      const tracks = response.data;

      if (tracks.length > 0) {
        const selectedTrack = tracks[0];
        const videoUrl = selectedTrack.videoUrl;
        const downloadApiUrl = `https://c-v1.onrender.com/downloader?url=${encodeURIComponent(videoUrl)}`;

        api.sendMessage("", chatId, async (err, info) => {
          if (err) {
            console.error(err);
            api.sendMessage("🚧 An error occurred while sending the message.", chatId);
            return;
          }

          try {
            const downloadLinkResponse = await axios.get(downloadApiUrl);
            const downloadLink = downloadLinkResponse.data.media.url;

            const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp4`);
            const writer = fs.createWriteStream(filePath);

            const downloadResponse = await axios({
              url: downloadLink,
              method: 'GET',
              responseType: 'stream'
            });

            downloadResponse.data.pipe(writer);

            writer.on('finish', () => {
              api.setMessageReaction("✅", info.messageID, () => {}, true);

              api.sendMessage({
                body : `◆❯━━━━━▣✦▣━━━━━━❮◆\n ✅ | تم تحميل المقطع بنجاح\n\n📒 | العنوان : ${selectedTrack.title}\n📅 | تاريخ النشر : ${selectedTrack.publishDate}\n👀 | المشاهدات : ${selectedTrack.viewCount}\n👍 | الإعحابات : ${selectedTrack.likeCount}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
                attachment: fs.createReadStream(filePath),
              }, chatId, () => fs.unlinkSync(filePath)); // Clean up the file after sending
            });

            writer.on('error', (err) => {
              console.error(err);
              api.sendMessage("🚧 An error occurred while processing your request.", chatId);
            });

          } catch (error) {
            console.error(error);
            api.sendMessage(`🚧 An error occurred while processing your request: ${error.message}`, chatId);
          }
        });

      } else {
        api.sendMessage("❓ Sorry, couldn't find the requested video.", chatId);
      }

    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 An error occurred while processing your request.", chatId, messageID);
    }
  }
};
