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
        const topTracks = tracks.slice(0,6);
        let message = "❍───────────────❍\n🎶 | إليك أفضل ست مقاطع\n\n";
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

        message += "\n🎯 | رد على الرسالة برقم لتحميل المقطع.";
        api.sendMessage({
          body: message,
          attachment: attachments.map(filePath => fs.createReadStream(filePath))
        }, event.threadID, (err, info) => {
          if (err) {
            console.error(err);
            api.sendMessage("🚧 | حدث خطأ أثناء إرسال الرسالة.", event.threadID);
            return;
          }
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "يوتيوب",
            unsend: true,
            tracks: topTracks
          });
        });
      } else {
        api.sendMessage("❓ | آسف، لا يمكن العثور على الفيديو المطلوب.", event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID, event.messageID);
    }
  },

  async onReply({ api, event, reply, args }) {
    if (reply.type === "pick" && args.length > 0) {
      const replyIndex = parseInt(args[0]);
      const { author, tracks } = reply;

      if (event.senderID !== author) return;

      try {
        if (isNaN(replyIndex) || replyIndex < 1 || replyIndex > tracks.length) {
          throw new Error("اختيار غير صحيح. يرجى الرد برقم يتوافق مع المقطع.");
        }

        const selectedTrack = tracks[replyIndex - 1];
        const videoUrl = selectedTrack.videoUrl;
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
                body: `🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nإليك الفيديو ${selectedTrack.title}.\n\n📒 | العنوان: ${selectedTrack.title}\n📅 | تاريخ النشر: ${selectedTrack.publishDate}\n👀 | المشاهدات: ${selectedTrack.viewCount}\n👍 | الإعجابات: ${selectedTrack.likeCount}\n\nاستمتع بالمشاهدة! 🥰`,
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
    } else {
      api.sendMessage("❓ | لا يمكن معالجة ردك. تأكد من اختيار رقم صحيح.", event.threadID);
    }

    api.unsendMessage(reply.messageID);
    global.client.handler.reply.delete(reply.messageID);
  }
};
