import fs from 'fs';
import path from 'path';
import yts from 'yt-search'; // تأكد من أن لديك مكتبة yt-search مثبتة
import ytdl from 'ytdl-core'; // تأكد من أن لديك مكتبة ytdl-core مثبتة

export default {
  name: "يوتيب",
  author: "HUSSEIN YACOUBI",
  role: "member",
   aliases:["يوتيوب"],
  description: "Searches for a video on YouTube and sends it if available.",

  execute: async ({ api, event, args }) => {
    const searchTerm = args.join(" ");

    if (!searchTerm) {
      return api.sendMessage("🆘 | ادخل شيئا للبحث عنه اسم اغنية مثلا . مثال : يوتيب او يوتيوب [عنوان المقطع]", event.threadID);
    }

    const searchMessage = await api.sendMessage(`🔍 | جاري البحث عن الفيديو.... : ${searchTerm}\n⏱️ | يرجى الانتظار.....`, event.threadID);

    try {
      const searchResults = await yts(searchTerm);
      if (!searchResults.videos.length) {
        return api.sendMessage("❕ | لم يتم ايجاد الفيديو ", event.threadID);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      const filePath = path.join(process.cwd(), "cache", fileName);

      if (fs.existsSync(filePath)) {
        console.log('[CACHE]', `File already downloaded. Using cached version: ${fileName}`);
        api.sendMessage({
          body: `${video.title}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);
      } else {
        const fileWriteStream = fs.createWriteStream(filePath);
        ytdl(videoUrl, { filter: 'audioandvideo' })
          .on('error', (err) => {
            console.error('Error downloading video:', err);
            api.sendMessage('An error occurred while downloading the video.', event.threadID);
          })
          .pipe(fileWriteStream);

        fileWriteStream.on('finish', async () => {
          fileWriteStream.end();

          const stats = fs.statSync(filePath);
          if (stats.size > 55000000) { // 55MB in bytes
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | فشل ارسال الفيديو ، لأن حجمه أكبر من 55 ميغابايت.', event.threadID);
          }

          api.sendMessage({
            body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n${video.title}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
            attachment: fs.createReadStream(filePath)
          }, event.threadID);
        });
      }
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('An error occurred while processing the command.', event.threadID);
    }
    
    await api.deleteMessage(event.threadID, searchMessage.messageID);
  }
};
