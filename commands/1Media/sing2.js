import axios from 'axios';
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search'; // تأكد من أنك قمت بتثبيت مكتبة yts-api أو استخدم المكتبة المناسبة

export default {
  name: "غني",
  author: "Kaguya Project",
  role: "member",
  aliases:["اغنية"],
  description: "Finds song lyrics and downloads the song.",
  execute: async function ({ api, event, args }) {
    const input = event.body;
    const text = input.substring(12);
    const data = text.split(" ");

    if (data.length < 1) {
      return api.sendMessage("╭┈ ❒ الاستخدام :\n╰┈➤ اكتب: اغنية او غني [عنوان الأغنية]", event.threadID, event.messageID);
    }

    const song = data.join(" ");
    
    try {
      // إرسال رسالة انتظار
      const waitingMessage = await api.sendMessage(`🔍 | جاري البحث عن الأغنية "${song}"، يرجى الانتظار...`, event.threadID);

      // جلب كلمات الأغنية
      const lyricsResponse = await axios.get(`https://api.heckerman06.repl.co/api/other/lyrics2?song=${encodeURIComponent(song)}`);
      const lyrics = lyricsResponse.data.lyrics || "لم يتم العثور على كلمات!";
      const title = lyricsResponse.data.title || "غير متوفر!";
      const artist = lyricsResponse.data.artist || "غير متوفر!";

      // البحث عن الفيديو
      const searchResults = await yts(song);
      if (!searchResults.videos.length) {
        await api.unsendMessage(waitingMessage.messageID);
        return api.sendMessage("❌ | لم يتم العثور على الأغنية.", event.threadID, event.messageID);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      // تنزيل الأغنية
      const stream = ytdl(videoUrl, { filter: "audioonly" });
      const fileName = `${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      // التأكد من وجود مجلد التخزين
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      stream.pipe(fs.createWriteStream(filePath)).on('finish', async () => {
        await api.unsendMessage(waitingMessage.messageID);
        console.info('[DOWNLOADER] Downloaded');

        if (fs.statSync(filePath).size > 26214400) { // التحقق من حجم الملف
          fs.unlinkSync(filePath);
          return api.sendMessage('[ERR] الملف أكبر من 25MB ولا يمكن إرساله.', event.threadID);
        }

        const message = {
          body: `❛ ━━━━･❪ 🕊️ ❫ ･━━━━ ❜\n🎵 إليك الأغنية، استمتع! 🥰\n\nالعنوان: ${title}\nالفنان: ${artist}\n\nكلمات الأغنية:\n${lyrics}\n❛ ━━━━･❪ 🕊️ ❫ ･━━━━ ❜`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath); // حذف الملف بعد الإرسال
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      await api.unsendMessage(waitingMessage.messageID);
      api.sendMessage('❌ | حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
