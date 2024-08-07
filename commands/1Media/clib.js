import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "يوتيوب",
  author: "YourName",
  role: "member",
  aliases: ["مقطع", "يوتيب"],
  description: "بحث ومشاهدة النقاطع على يوتيوب.",
  
  execute: async ({ api, event, args }) => {
    try {
      const type = args[0]?.toLowerCase();
      if (!type || !['اغنية', 'مقطع'].includes(type)) {
        return api.sendMessage(`⚠️ | يرجى استخدام الأمر بشكل صحيح: [اغنية/مقطع] <عنوان المقطع أو الأغنية>\n\nمثال: يوتيوب اغنية fifty fifty copied`, event.threadID, event.messageID);
      }
      
      const title = args.slice(1).join(" ");
      if (!title) return api.sendMessage("⚠️ | يرجى إدخال اسم الأغنية أو المقطع.", event.threadID, event.messageID);
      
      const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(title)}`);
      const videos = data.videos.slice(0, 6);
      
      if (videos.length === 0) {
        return api.sendMessage("❓ | لم أتمكن من العثور على أي مقاطع فيديو.", event.threadID, event.messageID);
      }

      const videoListMessage = videos.map((vid, i) => `${i + 1}. ${vid.title}\n⏰ | المدة: ${vid.duration}`).join("\n") + "\n\nرد على القائمة أعلاه برقم من 1 إلى 6";
      
      const videoThumbs = await Promise.all(videos.map(video => {
        const filePath = path.join(process.cwd(), 'cache', `${video.id}.jpg`);
        return axios({
          url: video.thumb,
          method: 'GET',
          responseType: 'stream'
        }).then(response => {
          return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
          });
        });
      }));

      const msg = {
        body: videoListMessage,
        attachment: videoThumbs.map(filePath => fs.createReadStream(filePath))
      };

      const messageInfo = await api.sendMessage(msg, event.threadID, event.messageID);
      
      global.client.handler.reply.set(messageInfo.messageID, {
        author: event.senderID,
        type: "pick",
        name: "يوتيوب",
        unsend: true
      });

    } catch (error) {
      console.error(error);
      api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, reply }) => {
    if (reply.type !== "pick" || reply.name !== "يوتيوب" || reply.author !== event.senderID) return;

    const choice = parseInt(event.body, 10);
    if (isNaN(choice) || choice < 1 || choice > 6) {
      return api.sendMessage("⚠️ | يرجى الرد برقم من 1 إلى 6.", event.threadID, event.messageID);
    }

    const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(args.slice(1).join(" "))}`);
    const selectedVideo = data.videos[choice - 1];
    if (!selectedVideo) return api.sendMessage("⚠️ | لم أتمكن من العثور على الفيديو المحدد.", event.threadID, event.messageID);
    const { url, title, duration } = selectedVideo;

    try {
      const downloadUrlResponse = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${encodeURIComponent(url)}&type=${type}`);
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
          body: `◆❯━━━━━▣✦▣━━━━━━❮◆\n📋 | العنوان: ${title}\n⏰ | المدة: ${duration}\n◆❯━━━━━▣✦▣━━━━━━❮◆`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath)); // Clean up the file after sending
      });

      writer.on('error', (err) => {
        console.error(err);
        api.sendMessage("🚧 | حدث خطأ أثناء معالجة طلبك.", event.threadID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage(`🚧 | حدث خطأ أثناء معالجة طلبك: ${error.message}`, event.threadID);
    }
  }
};
