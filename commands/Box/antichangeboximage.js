import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
 // تأكد من صحة مسار الاستيراد

const uploadImgbb = async (filePath) => {
  const formData = new FormData();
  formData.append('source', fs.createReadStream(filePath));
  formData.append('type', 'file');
  formData.append('action', 'upload');
  
  const res = await axios.post('https://imgbb.com/json', formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  return res.data.image.url;
};

class AntiBoxImage {
  name = "حماية_الصورة";
  author = "Kaguya Project";
  cooldowns = 60;
  description = "حماية المجموعة من تغيير صورتها!";
  role = "admin";
  aliases = [];

  async execute({ event, Threads, kaguya }) {
    try {
      if (event.role !== "admin") {
        return kaguya.reply("❌ | ليس لديك الصلاحيات اللازمة لتنفيذ هذا الأمر!");
      }

      const threadsData = (await Threads.find(event.threadID))?.data?.data || {};
      const status = !threadsData.anti?.imageBox;
      
      // تحديث الحالة
      await Threads.update(event.threadID, {
        anti: {
          imageBox: status,
        },
      });

      // نقل الصورة إلى مجلد cache
      const imageUrl = threadsData.imageSrc; // افترض أن لديك رابط الصورة في بيانات المجموعات
      if (imageUrl) {
        const response = await axios({
          method: 'GET',
          url: imageUrl,
          responseType: 'stream'
        });
        
        const cachePath = path.join(process.cwd(), 'cache', 'group_image.jpg');
        const writer = fs.createWriteStream(cachePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
          // رفع الصورة إلى imgbb
          const imageUrlOnImgbb = await uploadImgbb(cachePath);

          // تحديث بيانات حماية تغيير الصورة
          await Threads.update(event.threadID, {
            anti: { imageBox: imageUrlOnImgbb },
          });

          return kaguya.reply(`تم ${status ? "تشغيل" : "❌ إطفاء ✅"} ميزة الحماية من تغيير صورة المجموعة`);
        });

        writer.on('error', (err) => {
          console.error(err);
          return kaguya.reply("❌ | لقد حدث خطأ أثناء نقل الصورة.");
        });
      } else {
        return kaguya.reply("❌ | لا توجد صورة لتحديثها.");
      }
    } catch (err) {
      console.error(err);
      return kaguya.reply("❌ | لقد حدث خطأ غير متوقع!");
    }
  }

  async onRun({ event, Threads, api, kaguya }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const dataAntiChange = (await Threads.find(threadID))?.data?.data?.anti || {};

    if (!dataAntiChange.imageBox) return;

    switch (logMessageType) {
      case "log:thread-image": {
        if (api.getCurrentUserID() !== author) {
          kaguya.reply("حماية تغيير الصورة مشغلة بالفعل في صندوق الدردشة الخاص بك");
          api.changeGroupImage(
            await getStreamFromPath(dataAntiChange.imageBox),
            threadID
          );
        } else {
          const imageSrc = logMessageData.url;
          if (!imageSrc) {
            await Threads.update(threadID, {
              anti: { imageBox: "REMOVE" },
            });
          } else {
            const newImageSrc = await uploadImgbb(imageSrc);
            await Threads.update(threadID, {
              anti: { imageBox: newImageSrc },
            });
          }
        }
        break;
      }

      // إضافة التعديلات هنا إذا كنت ترغب في التعامل مع تغييرات أخرى
    }
  }
}

export default new AntiBoxImage();
