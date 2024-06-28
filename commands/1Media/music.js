import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search';
import axios from 'axios';

async function sing(api, event, args, message) {
  api.setMessageReaction("🕢", event.messageID, (err) => {}, true);

  try {
    let title = '';

    const extractShortUrl = async () => {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "video" || attachment.type === "audio") {
        return attachment.url;
      } else {
        throw new Error("Invalid attachment type.");
      }
    };

    if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
      const shortUrl = await extractShortUrl();
      const musicRecognitionResponse = await axios.get(`https://kaizenji-rest-api-bd61774dda46.herokuapp.com/music?url=${encodeURIComponent(shortUrl)}`);
      title = musicRecognitionResponse.data.title;
    } else if (args.length === 0) {
      api.sendMessage("يرجى تقديم عنوان أو رابط الأغنية.", event.threadID, event.messageID);
      return;
    } else {
      title = args.join(" ");
    }

    const searchResults = await yts(title);

    if (!searchResults.videos.length) {
      api.sendMessage("لم يتم العثور على أغنية للبحث المقدم.", event.threadID, event.messageID);
      return;
    }

    const videoUrl = searchResults.videos[0].url;
    const stream = await ytdl(videoUrl, { filter: "audioonly" });

    const fileName = `song.mp3`;
    const filePath = path.join(process.cwd(), "cache", fileName);

    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);

    writer.on('finish', () => {
      const audioStream = fs.createReadStream(filePath);
      api.sendMessage({ body: `🎧 | تشغيل: ${title}`, attachment: audioStream }, event.threadID, () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        fs.unlinkSync(filePath); // حذف الملف بعد الإرسال
      }, event.messageID);
    });

    writer.on('error', (error) => {
      console.error("Error:", error);
      api.sendMessage("حدث خطأ أثناء محاولة تشغيل الأغنية.", event.threadID, event.messageID);
    });

  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("حدث خطأ أثناء محاولة تشغيل الأغنية.", event.threadID, event.messageID);
  }
}

const command = {
  name: "اغنية",
  author: "Kaguya Project",
  role: "member",
  description: "تشغيل أغنية من YouTube بناءً على عنوان أو رابط.",
  
  execute: async ({ api, event, args, message }) => {
    await sing(api, event, args, message);
  }
};

export default command;
