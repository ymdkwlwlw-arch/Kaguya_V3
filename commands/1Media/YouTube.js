import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

export default {
  name: "اغنية",
  author: "YourName",
  role: "member",
  description: "Search and download music from YouTube.",
   
  execute: async ({ api, event, args }) => {
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
    const search = args.join(" ");
    const chatId = event.threadID;
    const messageID = event.messageID;

    if (!search) {
      return api.sendMessage(" ⚠️ | المرجو إدخال اسم الأغنية", chatId, messageID);
    }

    try {
      api.sendMessage(`🔍 | جاري البحث عن الأغنية : ${search}`, chatId, messageID);

      const searchResults = await yts(search);
      if (!searchResults.videos.length) {
        return api.sendMessage("No music found for your query.", chatId, messageID);
      }

      const music = searchResults.videos[0];
      const musicUrl = music.url;

      const stream = ytdl(musicUrl, { filter: "audioonly" });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading music: ${info.videoDetails.title}`);
      });

      const fileName = `${music.title}.mp3`;
      const filePath = path.join(process.cwd(), "cache", fileName);

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('end', () => {
        const stats = fs.statSync(filePath);
        if (stats.size > 226214400) { // 205MB in bytes
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ The file could not be sent because it is larger than 205MB.', chatId, messageID);
        }
          
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
        api.sendMessage({
          body: `${music.title}`,
          attachment: fs.createReadStream(filePath)
        }, chatId, () => fs.unlinkSync(filePath)); // Clean up the file after sending
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('An error occurred while processing the command.', chatId, messageID);
    }
  }
};
