import axios from 'axios';
import fs from 'fs';
import path from 'path';

const cacheDir = path.join(process.cwd(), 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

export default {
  name: "اغنية",
  author: "ArYAN",
  role: "member",
  description: "Searches for a song and sends the first result directly without user selection.",

  execute: async ({ api, event, args }) => {
    if (args.length === 0) {
      return api.sendMessage("⚠️ | إستعمال غير صالح \n💡كيفية الإستخدام: أغنية [عنوان الأغنية 📀]\n مثال : اغنية fifty fifty copied", event.threadID, event.messageID);
    }

    const searchQuery = encodeURIComponent(args.join(" "));
    const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;

    try {
      api.sendMessage("🎵 | جاري البحث عن اغنيتك...", event.threadID, event.messageID);

      const response = await axios.get(apiUrl);
      const tracks = response.data;

      if (tracks.length > 0) {
        const firstTrack = tracks[0];
        const videoUrl = firstTrack.videoUrl;
        const downloadApiUrl = `https://c-v1.onrender.com/yt/d?url=${encodeURIComponent(videoUrl)}`;
        
        api.sendMessage("⏳ | جاري التحميل ، يرجى الإنتظار...", event.threadID, async (err, info) => {
          if (err) {
            console.error('Error sending download message:', err);
            return api.sendMessage("🚧 | An error occurred while processing your request. Please try again later.", event.threadID);
          }

          try {
            const downloadLinkResponse = await axios.get(downloadApiUrl);
            const downloadLink = downloadLinkResponse.data.result.audio;

            if (!downloadLink) {
              throw new Error("Failed to get the download link.");
            }

            const filePath = path.join(cacheDir, `${Date.now()}.mp3`);
            const writer = fs.createWriteStream(filePath);

            const response = await axios({
              url: downloadLink,
              method: 'GET',
              responseType: 'stream'
            });

            response.data.pipe(writer);

            writer.on('finish', () => {
              api.setMessageReaction("✅", info.messageID);

              api.sendMessage({
                body: `🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n❍───────────────❍\n ✅ | تفضل اغنيتك ${firstTrack.title}.\n\n📒 | العنوان : ${firstTrack.title}\n📅 | تاريخ النشر : ${new Date(firstTrack.publishDate).toLocaleDateString()}\n👀 | عدد المشاهدات : ${firstTrack.viewCount}\n👍 | عدد الايكات: ${firstTrack.likeCount}\nإستمتع !...🥰\n❍───────────────❍`,
                attachment: fs.createReadStream(filePath),
              }, event.threadID, () => fs.unlinkSync(filePath));
            });

            writer.on('error', (err) => {
              console.error('Error saving the file:', err);
              api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
            });
          } catch (error) {
            console.error('Error during download:', error.message);
            api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
          }
        });
      } else {
        api.sendMessage("❓ | Sorry, couldn't find the requested music.", event.threadID);
      }
    } catch (error) {
      console.error('Error during search:', error.message);
      api.sendMessage("🚧 | An error occurred while processing your request. Please try again later.", event.threadID);
    }
  }
};
