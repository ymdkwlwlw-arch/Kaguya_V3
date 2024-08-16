import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقطع من YouTube",
  role: "عضو",
  aliases: ["يوتيب", "فيديو", "مقطع"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم المقطع.", event.threadID);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن المقطع المطلوب "${videoName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(videoName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data.results;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎥 | تم العثور على المقطع التالي:\n';
      const selectedVideo = searchResults[0];
      msg += `\n❀ العنوان: ${selectedVideo.title}`;

      msg += '\n\n📥 | الرجاء الرد بـ "تم" من أجل تأكيد التنزيل ومشاهدة المقطع.';

      api.unsendMessage(sentMessage.messageID);

      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "download",
          video: selectedVideo,
          unsend: true
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'download') return;

    const { author, video } = reply;

    if (event.senderID !== author) return;

    if (event.body.toLowerCase() !== "تم") {
      return api.sendMessage("❌ | الرد غير صالح. يرجى الرد بـ 'تم' لتنزيل المقطع.", event.threadID);
    }

    const videoUrl = video.link;

    try {
      const downloadUrl = `https://king-aryanapis.onrender.com/api/ytdl?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(downloadUrl);

      const videoFileUrl = downloadResponse.data.result.video;
      if (!videoFileUrl) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل المقطع.", event.threadID);
      }

      const fileName = `${event.senderID}.mp4`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const videoStream = axios.get(videoFileUrl, { responseType: 'stream' }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
          }

          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

          const message = {
            body: `✅ | تم تنزيل المقطع:\n❀ العنوان: ${video.title}`,
            attachment: fs.createReadStream(filePath)
          };

          api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
