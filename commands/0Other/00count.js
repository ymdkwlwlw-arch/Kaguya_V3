import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "شوتي",
  author: "Joshua Apostol",
  role: "member",
  aliases:["shoti"],
  description: "Fetches a girl edit video from the API and sends it to the chat.",
  
  async execute({ api, event }) {
    const { threadID, messageID } = event;

    try {
      // إرسال رسالة الإنتظار
      api.sendMessage("⏱️ | جاري البحث و إرسال مقطع شوتي ، يرجى الانتظار...", threadID, (err, waitMessageID) => {
        if (err) return console.error("Error sending wait message:", err);

        // طلب الفيديو من API
        axios.post("https://girledit-api-version-2-production-e493.up.railway.app/api/request/f", { credits: "joshua apostol" })
          .then(response => {
            const { url: videoUrl, username, nickname } = response.data;

            // تحديد مسار تخزين الفيديو مؤقتًا
            const videoPath = path.resolve(process.cwd(), 'girledit_video.mp4');
            const writer = fs.createWriteStream(videoPath);

            // تحميل الفيديو
            axios({
              url: videoUrl,
              method: 'GET',
              responseType: 'stream'
            }).then(responseStream => {
              responseStream.data.pipe(writer);

              writer.on('finish', () => {
                // حذف رسالة الإنتظار
                api.unsendMessage(waitMessageID);

                // إرسال الفيديو مع معلومات المستخدم والنك نيم
                api.setMessageReaction("✅", event.messageID, (err) => {}, true); 
                api.sendMessage({
                  body: `✅ | تـم تـحـمـيـل مـقـطـع شـوتـي \n👤 | الـإسـم : ${username}\n💬 | الـلـقـب : ${nickname}`,
                  attachment: fs.createReadStream(videoPath)
                }, threadID, () => fs.unlinkSync(videoPath), messageID);
              });

              writer.on('error', (err) => {
                console.error('Error writing video file:', err);
                api.sendMessage("⚠️ | حدث خطأ أثناء كتابة ملف الفيديو.", threadID, messageID);
              });
            }).catch(err => {
              console.error('Error downloading video:', err.message);
              api.unsendMessage(waitMessageID);
              api.sendMessage("⚠️ | حدث خطأ أثناء تحميل الفيديو.", threadID, messageID);
            });
          }).catch(error => {
            console.error('Error fetching girl edit API:', error.message);
            api.unsendMessage(waitMessageID);
            api.sendMessage(`⚠️ | حدث خطأ أثناء استدعاء API!\n${error.message}`, threadID, messageID);
          });
      });
    } catch (error) {
      console.error('Error executing girledit command:', error.message);
      api.sendMessage(`⚠️ | حدث خطأ أثناء التنفيذ!\n${error.message}`, threadID, messageID);
    }
  }
};
