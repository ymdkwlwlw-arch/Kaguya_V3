import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "سبوتيفاي",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل أغنية من Spotify",
  role: "عضو",
  aliases: ["اغنية", "غني", "موسيقى", "أغنية"],

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

      const searchUrl = `https://www.samirxpikachu.run.place/spotifysearch?q=${encodeURIComponent(songName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎶 | تم العثور على الأغنية التالية:\n';
      const selectedSong = searchResults[0];
      msg += `\n❀ العنوان: ${selectedSong.title}`;
      msg += `\n❀ الفنان: ${selectedSong.artist}`;
      msg += `\n❀ الألبوم: ${selectedSong.album}`;

      // Download the album cover image
      const imagePath = path.join(process.cwd(), 'cache', `${selectedSong.title.replace(/\s+/g, '_')}.jpg`);
      const imageWriter = fs.createWriteStream(imagePath);
      const imageStream = await axios({
        url: selectedSong.thumbnail,
        responseType: 'stream',
      });
      imageStream.data.pipe(imageWriter);

      await new Promise((resolve, reject) => {
        imageWriter.on('finish', resolve);
        imageWriter.on('error', reject);
      });

      msg += '\n\n📥 | الرجاء الرد بـ "تم" من أجل تنزيل الأغنية.';

      api.unsendMessage(sentMessage.messageID);

      api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imagePath),
      }, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "سبوتيفاي",
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
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) return;

    if (event.body.toLowerCase() !== "تم") {
      return api.sendMessage("❌ | الرد غير صالح. يرجى الرد بـ 'تم' لتنزيل الأغنية.", event.threadID);
    }

    const song = searchResults[0];
    const downloadUrl = song.preview_mp3;

    if (!downloadUrl) {
      return api.sendMessage("❌ | لا تتوفر معاينة لهذه الأغنية.", event.threadID);
    }

    try {
      const fileName = `${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      const songStream = axios.get(downloadUrl, { responseType: 'stream' }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
          }

          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

          const message = {
            body: `✅ | تم تنزيل الأغنية:\n❀ العنوان: ${song.title}`,
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
