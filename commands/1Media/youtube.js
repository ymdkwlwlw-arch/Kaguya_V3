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
        const topTracks = tracks.slice(0, 6);
        let message = "❍───────────────❍\n🎶 | إليك ست نتائج تطابق نتيجة البحث:\n";
        const attachments = await Promise.all(topTracks.map(async (track) => {
          const thumbnailPath = path.join(process.cwd(), 'cache', `${track.id}_thumbnail.png`);
          await axios({
            url: track.thumbnail,
            method: 'GET',
            responseType: 'stream'
          }).then(response => {
            return new Promise((resolve, reject) => {
              const writer = fs.createWriteStream(thumbnailPath);
              response.data.pipe(writer);
              writer.on('finish', () => resolve(thumbnailPath));
              writer.on('error', reject);
            });
          });
          return thumbnailPath;
        }));

        topTracks.forEach((track, index) => {
          message += `🆔 | المعرف: ${index + 1}\n`;
          message += `📝 | العنوان: ${track.title}\n`;
          message += `📅 | تاريخ الرفع: ${track.publishDate}\n`;
          message += "❍───────────────❍\n"; // Separator between tracks
        });

        message += "\n🎯 | رد على الرسالة برقم لتحميل الفيديو مباشرة.";
        api.sendMessage({
          body: message,
          attachment: attachments.map(filePath => fs.createReadStream(filePath))
        }, event.threadID, async (err, info) => {
          if (err) {
            console.error(err);
            api.sendMessage("🚧 | حدث خطأ أثناء إرسال الرسالة.", event.threadID);
            return;
          }

          // إضافة معالج لردود الرسائل بدون الحاجة إلى خاصية `onReply`
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "download",
            name: "يوتيوب",
            unsend: true,
            tracks: topTracks,
            messageID: info.messageID
          });

          // تبدأ تحميل الفيديو مباشرة
          await this.downloadVideo(topTracks[0], api, event);
        });
      } else {
        api.sendMessage("❓ | آسف، لا يمكن العثور على الفيديو.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
    }
  },

  async downloadVideo(track, api, event) {
    try {
      const videoUrl = track.videoUrl;
      const downloadApiUrl = `https://c-v1.onrender.com/downloader?url=${encodeURIComponent(videoUrl)}`;

      api.sendMessage("⏳ | جاري تحميل المقطع...", event.threadID, async (err) => {
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
            api.setMessageReaction("✅", event.messageID, () => {}, true);

            api.sendMessage({
              body: `◆❯━━━━━▣✦▣━━━━━━❮◆\nإليك الفيديو ${track.title}.\n\n📒 | العنوان: ${track.title}\n📅 | تاريخ النشر: ${track.publishDate}\n👀 | المشاهدات: ${track.viewCount}\n👍 | الإعجابات: ${track.likeCount}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
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
    } catch (error) {
      console.error(error);
      api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID);
    }
  }
};
