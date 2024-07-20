import axios from "axios";
import fs from "fs";
import path from "path";
import tinyurl from "tinyurl";
import yts from "yt-search";
import ytdl from "ytdl-core";

export default {
  name: "غني",
  author: "Kaguya Project",
  role: "member",
  aliases:["أغنية","غني"],  
  description: "يبحث عن مقطع موسيقى من اليوتيوب بناءً على رابط أو اسم أغنية",
  execute: async ({ api, event, message, args }) => {
    try {
      const attachment = event.messageReply?.attachments[0];
      if (event.type === "message_reply" && ["audio", "video"].includes(attachment?.type)) {
        const attachmentUrl = attachment.url;
        const shortUrl = await tinyurl.shorten(attachmentUrl) || args.join(' ');

        const response = await axios.get(`https://www.api.vyturex.com/songr?url=${shortUrl}`);

        if (response.data && response.data.title) {
          const song = response.data.title;
          const originalMessage = await message.reply(`جاري البحث عن "${song}"...`);
          const searchResults = await yts(song);

          if (!searchResults.videos.length) {
            return kaguya.reply("❌ | لم يتم العثور على الأغنية.");
          }

          const video = searchResults.videos[0];
          const videoUrl = video.url;
          const fileName = `music.mp3`;
          const filePath = path.join(process.cwd(), 'tmp', fileName);

          const stream = ytdl(videoUrl, { filter: "audioonly" });
          const file = fs.createWriteStream(filePath);

          stream.pipe(file);

          stream.on('response', () => {
            console.info('[DOWNLOADER]', 'بدء التحميل الآن!');
          });

          stream.on('info', (info) => {
            console.info('[DOWNLOADER]', `جاري تحميل ${info.videoDetails.title} بواسطة ${info.videoDetails.author.name}`);
          });

          stream.on('end', async () => {
            console.info('[DOWNLOADER] تم التحميل');
            if (fs.statSync(filePath).size > 26214400) { // 25MB
              fs.unlinkSync(filePath);
              return kaguya.reply('❌ | الملف أكبر من 25MB ولا يمكن إرساله.');
            }

            const replyMessage = {
              body: `━━━━━◈✿◈━━━━━\n[📀] العنوان : ${video.title}\n🎤 | الفنان : ${video.author.name}\n━━━━━◈✿◈━━━━━`,
              attachment: fs.createReadStream(filePath),
            };

            await api.unsendMessage(originalMessage.messageID);
            await api.sendMessage(replyMessage, event.threadID, () => {
              fs.unlinkSync(filePath);
            });
          });
        } else {
          return kaguya.reply("❌ | لم يتم العثور على معلومات الأغنية.");
        }
      } else {
        const input = event.body;
        const song = input.substring(12).trim();

        if (!song) {
          return kaguya.reply("⚠️ | يرجى إدخال اسم الأغنية.");
        }

        const originalMessage = await kaguya.reply(`جاري البحث عن أغنيتك "${song}"...`);
        const searchResults = await yts(song);

        if (!searchResults.videos.length) {
          return kaguya.reply("❌ | طلب غير صالح.");
        }

        const video = searchResults.videos[0];
        const videoUrl = video.url;
        const fileName = `music.mp3`;
        const filePath = path.join(process.cwd(), 'tmp', fileName);

        const stream = ytdl(videoUrl, { filter: "audioonly" });
        const file = fs.createWriteStream(filePath);

        stream.pipe(file);

        stream.on('response', () => {
          console.info('[DOWNLOADER]', 'بدء التحميل الآن!');
        });

        stream.on('info', (info) => {
          console.info('[DOWNLOADER]', ` ⏱️ | جاري تحميل ${info.videoDetails.title} بواسطة ${info.videoDetails.author.name}`);
        });

        stream.on('end', async () => {
          console.info('[DOWNLOADER] تم التحميل');
          if (fs.statSync(filePath).size > 26214400) { // 25MB
            fs.unlinkSync(filePath);
            return kaguya.reply('❌ | الملف أكبر من 25MB ولا يمكن إرساله.');
          }

          const replyMessage = {
            body: `━━━━━◈✿◈━━━━━\n[📀]العنوان: ${video.title}\n🎤 | الفنان: ${video.author.name}\n━━━━━◈✿◈━━━━━`,
            attachment: fs.createReadStream(filePath),
          };

          await api.unsendMessage(originalMessage.messageID);
          await api.sendMessage(replyMessage, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });
      }
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage("❌ | لم تتوفر الأغنية في الوقت الحالي. يرجى المحاولة لاحقاً.", event.threadID, event.messageID);
    }
  }
};
