import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل مقاطع الفيديو أو الأغاني من YouTube",
  role: "عضو",
  aliases: ["يوتيب"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");
    
    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال عنوان المقطع أو الأغنية.", event.threadID);
    }

    const type = data[0].toLowerCase(); // "يوتيوب مقطع" or "يوتيوب اغنية"
    data.shift();
    const title = data.join(" ");

    try {
      api.sendMessage(`✔ | جاري البحث عن "${title}". المرجو الانتظار...`, event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: type.includes("مقطع") ? "video" : "song",
          title: title,
          unsend: info.messageID,
        });
      });

      const searchUrl = `https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(title)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data.results;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎵 | تم العثور على النتائج التالية:\n';
      searchResults.forEach((result, index) => {
        msg += `\n${index + 1}. ${result.title} - ⏱️ ${result.duration}`;
        msg += `\n📷 | ${result.thumbnail}`;
      });

      msg += '\n\n📥 | الرجاء الرد ب "تم" من أجل التنزيل والمشاهدة او الإستماع.';

      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: type.includes("مقطع") ? "video" : "song",
          searchResults: searchResults,
          unsend: true
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'video' && reply.type !== 'song') return;

    const { author, searchResults } = reply;
    if (event.senderID !== author || event.body.toLowerCase() !== "تم") return;

    const selectedVideo = searchResults[0];
    const title = selectedVideo.title;
    const duration = selectedVideo.duration;
    const videoUrl = selectedVideo.link;

    try {
      // Download link for either video or audio
      const downloadUrl = reply.type === 'video' 
        ? `https://hiroshi-rest-api.replit.app/tools/yt?url=${encodeURIComponent(videoUrl)}` 
        : `https://hiroshi-rest-api.replit.app/tools/yt?url=${encodeURIComponent(videoUrl)}`;

      const downloadResponse = await axios.get(downloadUrl);
      const fileUrl = reply.type === 'video' ? downloadResponse.data.mp4 : downloadResponse.data.mp3;

      if (!fileUrl) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط التحميل.", event.threadID);
      }

      const fileName = `${event.senderID}.${reply.type === 'video' ? 'mp4' : 'mp3'}`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const fileStream = axios.get(fileUrl, { responseType: 'stream' }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
          }

          const message = {
            body: `✅ | تم العثور على ${reply.type === 'video' ? 'المقطع' : 'الأغنية'}:\n❀ العنوان: ${title}\n⏱️ المدة: ${duration}`,
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
