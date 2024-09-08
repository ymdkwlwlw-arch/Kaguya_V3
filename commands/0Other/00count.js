import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "شوتي",
  author: "Joshua Apostol",
  role: "member",
  aliases: ["shoti"],
  description: "Fetches a girl edit video from the API and sends it to the chat.",
  
  async execute({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
      // إرسال رسالة الانتظار
      api.sendMessage("⏱️ | جاري البحث عن مقطع شوتي، يرجى الانتظار...", threadID, async (err, waitMessageID) => {
        if (err) return console.error("Error sending wait message:", err);

        // طلب البيانات من API الجديد
        try {
          const response = await axios.get("https://shoti-api.adaptable.app/api/v1/request-f?fbclid=IwZXh0bgNhZW0CMTEAAR0hG3KH_ccxUdIIcBXQ5A8wEQyx7iZuCEcUfAAEPYk8kUFa6Yc4Ok8mwB4_aem_6NYypi603YoZOnlFAT037A");
          const { url: videoUrl, cover, title, duration, user } = response.data.data;
          const { username, nickname } = user;

          // مسار تخزين الصورة مؤقتًا
          const imagePath = path.resolve(process.cwd(), 'shoti_cover.jpg');
          const imageResponse = await axios({
            url: cover,
            method: 'GET',
            responseType: 'stream'
          });
          
          const writer = fs.createWriteStream(imagePath);
          imageResponse.data.pipe(writer);

          writer.on('finish', () => {
            // حذف رسالة الانتظار
            api.unsendMessage(waitMessageID.messageID);

            // إرسال صورة الغلاف مع العنوان وطلب الرد بتم
            api.sendMessage({
              body: `🎬 | الـعـنـوان : ${title}\n⏳ | الـمـدة: ${duration}\n👤 | الـإسـم : ${username}\n💬 | الـلـقـب : ${nickname}\n\n 🔖 | الرجاء الرد بـ "تم" لتحميل الفيديو.`,
              attachment: fs.createReadStream(imagePath)
            }, threadID, (err, info) => {
              if (err) return console.error("Error sending cover image:", err);
              
              // تخزين البيانات للرد باستخدام onReply
              global.client.handler.reply.set(info.messageID, {
                author: senderID,
                type: "pick",
                videoUrl,
                title,
                duration,
                username,
                nickname,
                unsend: true
              });

              // حذف الصورة المؤقتة بعد الإرسال
              fs.unlinkSync(imagePath);
            }, messageID);
          });

          writer.on('error', (err) => {
            console.error('Error writing cover image file:', err);
            api.sendMessage("⚠️ | حدث خطأ أثناء كتابة ملف الصورة.", threadID, messageID);
          });

        } catch (error) {
          console.error('Error fetching Shoti API:', error.message);
        
          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);
          api.unsendMessage(waitMessageID.messageID);
          api.sendMessage(`⚠️ | حدث خطأ أثناء استدعاء API!\n${error.message}`, threadID, messageID);
        }
      });

    } catch (error) {
      console.error('Error executing Shoti command:', error.message);
      api.sendMessage(`⚠️ | حدث خطأ أثناء التنفيذ!\n${error.message}`, threadID, messageID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;
    const { author, videoUrl, title, duration, username, nickname } = reply;

    if (event.senderID !== author) return;

    const { threadID, messageID } = event;

    try {
      // مسار تخزين الفيديو مؤقتًا
      const videoPath = path.resolve(process.cwd(), 'shoti_video.mp4');
      const writer = fs.createWriteStream(videoPath);

      // تحميل الفيديو
      const response = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      writer.on('finish', () => {
        // إرسال الفيديو مع المعلومات
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
        api.sendMessage({
          body: `✅ | تـم تـحـمـيـل مـقـطـع شـوتـي \n🎬 | الـعـنـوان: ${title}\n⏳ | الـمـدة: ${duration}\n👤 | الـإسـم: ${username}\n💬 | الـلـقـب: ${nickname}`,
          attachment: fs.createReadStream(videoPath)
        }, threadID, () => fs.unlinkSync(videoPath), messageID);
      });

      writer.on('error', (err) => {
        console.error('Error writing video file:', err);
        api.sendMessage("⚠️ | حدث خطأ أثناء كتابة ملف الفيديو.", threadID, messageID);
      });

    } catch (error) {
      console.error('Error downloading video:', error.message);
      api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", threadID, messageID);
    }
  }
};
