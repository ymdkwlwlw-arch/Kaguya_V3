import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "YourName",
  role: "member",
  aliases: ["مقطع", "يوتيب"],
  description: "بحث ومشاهدة المقطع على يوتيوب.",
  
  execute: async ({ api, event, args }) => {
    try {
      const type = args[0]?.toLowerCase();
      if (!type || type !== 'مقطع') {
        return api.sendMessage(`⚠️ | يرجى استخدام الأمر بشكل صحيح: [مقطع] <عنوان المقطع>\n\nمثال: يوتيوب مقطع funny cat video`, event.threadID, event.messageID);
      }
      
      const title = args.slice(1).join(" ");
      if (!title) return api.sendMessage("⚠️ | يرجى إدخال اسم المقطع.", event.threadID, event.messageID);
      
      const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(title)}`);
      const videos = data.videos.slice(0, 1); // جلب مقطع واحد فقط
      
      if (videos.length === 0) {
        return api.sendMessage("❓ | لم أتمكن من العثور على أي مقاطع فيديو.", event.threadID, event.messageID);
      }

      const video = videos[0];
      const { thumb, title: videoTitle, duration, url } = video;
      
      // تحميل الصورة المصغرة
      const thumbPath = path.join(process.cwd(), 'cache', `${video.id}.jpg`);
      await axios({
        url: thumb,
        method: 'GET',
        responseType: 'stream'
      }).then(response => {
        return new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(thumbPath);
          response.data.pipe(writer);
          writer.on('finish', () => resolve(thumbPath));
          writer.on('error', reject);
        });
      });

      // تحميل الفيديو
      const downloadUrlResponse = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${encodeURIComponent(url)}&type=mp4`);
      const downloadLink = downloadUrlResponse.data.url;
      const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp4`);
      
      const writer = fs.createWriteStream(filePath);
      const downloadResponse = await axios({
        url: downloadLink,
        method: 'GET',
        responseType: 'stream'
      });
      
      downloadResponse.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({
          body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n📋 | العنوان: ${videoTitle}\n⏰ | المدة: ${duration}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath)); // تنظيف الملف بعد الإرسال
      });

      writer.on('error', (err) => {
        console.error(err);
        api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
