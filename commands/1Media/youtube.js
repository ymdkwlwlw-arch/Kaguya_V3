import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

async function downloadVideo(url) {
  try {
    // إرسال طلب للحصول على البيانات
    const response = await axios.get(`https://samirxpikachuio.onrender.com/alldl?url=${encodeURIComponent(url)}`);
    
    if (response.data && response.data.video_url) {
      // الحصول على رابط الفيديو من البيانات المسترجعة
      const videoUrl = response.data.video_url;
      
      // تحميل الفيديو
      const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
      
      // تحديد مسار التخزين
      const videoPath = path.join(process.cwd(), 'cache', 'video.mp4');
      
      // كتابة الفيديو إلى الملف
      videoResponse.data.pipe(fs.createWriteStream(videoPath));
      
      console.log('Video downloaded successfully!');
      return videoPath; // إرجاع مسار الفيديو لتنفيذه لاحقًا
    } else {
      console.log('Video URL not found in response.');
      throw new Error('Video URL not found in response.');
    }
  } catch (error) {
    console.error('Error downloading video:', error);
    throw error; // إعادة الخطأ لتعامل معه في مكان آخر
  }
}

export default {
  name: "يوتيوب",
  author: "حسين يعقوبي",
  cooldowns: 60,
  description: "تنزيل فيديو من YouTube",
  role: "عضو",
  aliases: ["فيديو", "يوتيب", "مقطع"],

  async execute({ api, event }) {
    const input = event.body;
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ | أرجوك قم بإدخال اسم الفيديو.", event.threadID);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      api.sendMessage(`✔ | جاري البحث عن الفيديو المطلوب "${videoName}". المرجو الانتظار...`, event.threadID);

      // البحث عن الفيديو باستخدام الرابط الجديد
      const searchUrl = `https://hiroshi-rest-api.replit.app/search/youtube?q=${encodeURIComponent(videoName)}`;
      const searchResponse = await axios.get(searchUrl);

      const searchResults = searchResponse.data.results;
      if (!searchResults || searchResults.length === 0) {
        return api.sendMessage("⚠️ | لم يتم العثور على أي نتائج.", event.threadID);
      }

      let msg = '🎥 | تم العثور على الفيديوهات التالية:\n';
      searchResults.forEach((video, index) => {
        msg += `\n${index + 1}. ${video.title} - ⏱️ ${video.duration}`;
      });

      msg += '\n\n📥 | الرجاء الرد برقم الفيديو الذي ترغب في تنزيله.';

      api.sendMessage(msg, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          name: "يوتيوب",
          searchResults: searchResults,
          unsend: true
        });
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  },

  async onReply({ api, event, reply }) {
    if (reply.type !== 'pick') return;

    const { author, searchResults } = reply;

    if (event.senderID !== author) return;

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > searchResults.length) {
      return api.sendMessage("❌ | الاختيار غير صالح. الرجاء الرد برقم صحيح.", event.threadID);
    }

    const selectedVideo = searchResults[choice - 1];
    const title = selectedVideo.title;
    const duration = selectedVideo.duration;
    const videoUrl = selectedVideo.link;

    try {
      const filePath = await downloadVideo(videoUrl); // استخدام دالة تحميل الفيديو

      if (!filePath) {
        return api.sendMessage("⚠️ | لم يتم العثور على رابط تحميل الفيديو.", event.threadID);
      }

      if (fs.statSync(filePath).size > 262144000) { // حجم الفيديو 250 ميغابايت
        fs.unlinkSync(filePath);
        return api.sendMessage('❌ | لا يمكن إرسال الملف لأن حجمه أكبر من 250 ميغابايت.', event.threadID);
      }

      // إرسال الرسالة مع المرفق
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      const message = {
        body: `✅ | تم العثور على الفيديو:\n❀ العنوان: ${title}\n⏱️ المدة: ${duration}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      });

    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('🥱 ❀ حدث خطأ أثناء معالجة الأمر.', event.threadID);
    }
  }
};
