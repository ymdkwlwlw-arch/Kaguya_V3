import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل أغنية من YouTube بصيغة MP3",
  role: "عضو",
  aliases: ["غني", "أغنية", "غني"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم الأغنية.", event.threadID);
    }

    data.shift();
    const songName = data.join(" ");

    try {
      const sentMessage = await api.sendMessage(`✔ | جاري البحث عن الأغنية المطلوبة "${songName}". المرجو الانتظار...`, event.threadID);

      const searchUrl = `https://c-v1.onrender.com/yt/s?query=${encodeURIComponent(songName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎶 | تم العثور على الأغاني التالية:\n';
      const selectedResults = searchResults.slice(0, 4); // Get only the first 4 results

      const attachments = [];

      // Process each result
      for (let i = 0; i < selectedResults.length; i++) {
        const video = selectedResults[i];
        msg += `\n${i + 1}. ❀ العنوان: ${video.title}`;

        // Download the thumbnail image for each result
        const thumbnailPath = path.join(process.cwd(), 'cache', `${video.videoId}.jpg`);
        const thumbnailWriter = fs.createWriteStream(thumbnailPath);
        const thumbnailStream = await axios({
          url: video.thumbnail,
          responseType: 'stream',
        });
        thumbnailStream.data.pipe(thumbnailWriter);

        await new Promise((resolve, reject) => {
          thumbnailWriter.on('finish', resolve);
          thumbnailWriter.on('error', reject);
        });

        attachments.push(fs.createReadStream(thumbnailPath));
      }

      msg += '\n\n📥 | الرجاء الرد برقم الأغنية التي تود تنزيلها بصيغة MP3.';

      api.unsendMessage(sentMessage.messageID);

      api.sendMessage({
        body: msg,
        attachment: attachments
      }, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "يوتيوب",
          searchResults: selectedResults,
          unsend: true
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) return;

    const selectedIndex = parseInt(event.body, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= searchResults.length) {
      return api.sendMessage("❌ | الرد غير صالح. يرجى الرد برقم صحيح.", event.threadID);
    }

    const video = searchResults[selectedIndex];
    const videoUrl = video.videoUrl;

    try {
      const downloadUrl = `https://c-v1.onrender.com/yt/d?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(downloadUrl);

      const audioFileUrl = downloadResponse.data.result.audio;
      if (!audioFileUrl) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل الأغنية.", event.threadID);
      }

      api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

      const fileName = `${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const audioStream = await axios.get(audioFileUrl, { responseType: 'stream' });
      audioStream.data.pipe(writer);

      writer.on('finish', () => {
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
        }

        // Send the audio file
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        api.sendMessage({
          body: `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${video.title}`,
          attachment: fs.createReadStream(filePath),
        }, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });
      writer.on('error', (error) => {
        console.error('[ERROR]', error);
        api.sendMessage('🥱 ❀ حدث خطأ أثناء تنزيل الأغنية.', event.threadID);
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة طلب التنزيل.', event.threadID);
    }

    // تنظيف البيانات المؤقتة بعد انتهاء العملية
    if (reply.unsend) {
      api.unsendMessage(reply.messageID);
    }

    global.client.handler.reply.delete(event.messageID);
  },
};
