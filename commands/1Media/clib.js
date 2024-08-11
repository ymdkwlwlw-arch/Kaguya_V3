import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "YourName",
  role: "member",
  aliases: ["مقطع", "يوتيب"],
  description: "بحث وتحميل مقطع واحد من يوتيوب.",
  
  execute: async ({ api, event, args }) => {
    try {
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);

      const title = args.join(" ");
      if (!title) return api.sendMessage("⚠️ | يرجى إدخال اسم المقطع.", event.threadID, event.messageID);

      // البحث عن الفيديو
      const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(title)}`);
      const videos = data.videos.slice(0, 1); // جلب مقطع واحد فقط

      if (videos.length === 0) {
        return api.sendMessage("❓ | لم أتمكن من العثور على أي مقاطع فيديو.", event.threadID, event.messageID);
      }

      const video = videos[0];
      const { url, title: videoTitle } = video;

      // الحصول على رابط تحميل الفيديو
      const downloadUrlResponse = await axios.get(`https://www.noobs-api.000.pe/dipto/alldl?url=${encodeURIComponent(url)}`);
      if (downloadUrlResponse.status !== 200) {
        throw new Error(`فشل الحصول على رابط التنزيل: ${downloadUrlResponse.statusText}`);
      }

      const downloadLink = downloadUrlResponse.data.result;
      if (!downloadLink) {
        throw new Error("لم يتم العثور على رابط تحميل.");
      }

      const filePath = path.join(process.cwd(), 'cache', `${Date.now()}.mp4`);
      
      // تحميل الفيديو
      const writer = fs.createWriteStream(filePath);
      const downloadResponse = await axios({
        url: downloadLink,
        method: 'GET',
        responseType: 'stream'
      });
      
      downloadResponse.data.pipe(writer);

      writer.on('finish', () => {
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
        api.sendMessage({
          body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n📋 | العنوان: ${videoTitle}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath)); // تنظيف الملف بعد الإرسال
      });

      writer.on('error', (err) => {
        console.error("Error while processing video:", err);
        api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
      });

    } catch (error) {
      console.error("Error during API request:", error);
      api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
