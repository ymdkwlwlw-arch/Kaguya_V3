import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { PassThrough } from 'stream';

export default {
  name: "اغنية",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل أغنية من YouTube",
  role: "عضو",
  aliases: ["أغنية","غني","موسيقى"],

  async execute({ api, event }) {
    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم الأغنية.", event.threadID);
    }

    data.shift();
    const musicName = data.join(" ");

    try {
      api.sendMessage(`✔ | جاري البحث عن الأغنية المطلوبة "${musicName}". المرجو الانتظار...`, event.threadID);

      const apiUrl = `https://www.noobs-api.000.pe/dipto/spotifydl?songName=${encodeURIComponent(musicName)}`;
      const response = await axios.get(apiUrl);

      const info = response.data.info;
      if (!info || !info.audio.length) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      const title = info.title;
      const duration = info.audio[0].durationText;
      const audioUrl = info.audio[0].url;

      // تحديد مسار تخزين الملف
      const fileName = `${event.senderID}.mp3`;
      const filePath = path.join(process.cwd(), 'cache', fileName);

      // إنشاء Stream لتنزيل الملف
      const writer = fs.createWriteStream(filePath);
      const audioStream = axios.get(audioUrl, { responseType: 'stream' }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {
          if (fs.statSync(filePath).size > 26214400) {
            fs.unlinkSync(filePath);
            return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 25 ميغابايت.', event.threadID);
          }

          // إرسال الرسالة مع المرفق
          
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
  
          const message = {
            body: `✅ | تم العثور على الأغنية:\n❀ العنوان: ${title}\n⏱️ المدة: ${duration}`,
            attachment: fs.createReadStream(filePath)
          };

          api.sendMessage(message, event.threadID, () => {
            fs.unlinkSync(filePath);
          });
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
