import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

/**
 * رفع صورة إلى imgBB والحصول على URL الخاص بها.
 * @param {string} filePath - مسار الصورة.
 * @returns {Promise<string>} - رابط الصورة على imgBB.
 */
const uploadImgbb = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('source', fs.createReadStream(filePath));
    formData.append('action', 'upload');

    // إرسال طلب GET للحصول على auth_token
    const response = await axios.get('https://imgbb.com');
    const auth_token = response.data.match(/auth_token="([^"]+)"/)[1];
    const timestamp = Date.now();

    formData.append('timestamp', timestamp);
    formData.append('auth_token', auth_token);

    // إرسال طلب POST لرفع الصورة
    const uploadResponse = await axios.post('https://imgbb.com/json', formData, {
      headers: formData.getHeaders(),
    });

    return uploadResponse.data.image.url;
  } catch (err) {
    throw new Error(err.response ? err.response.data : err.message);
  }
};

class AntiboxImage {
  constructor() {
    this.name = 'حماية_الصورة';
    this.author = 'Kaguya Project';
    this.cooldowns = 60;
    this.description = 'حماية المجموعة من تغيير صورتها!';
    this.role = 'admin';
    this.aliases = [];
  }

  /**
   * تنفيذ الأمر للحماية من تغيير صورة المجموعة.
   * @param {object} params - المعلمات التي تحتوي على api وevent وThreads.
   */
  async execute({ event, Threads, api }) {
    try {
      const { threadID } = event;
      const threadData = (await Threads.find(threadID))?.data?.data;
      const status = threadData?.anti?.imageBox ? false : true;

      // الحصول على صورة المجموعة الحالية باستخدام fetchGroupImage
      const currentImage = await api.fetchGroupImage(threadID);
      const tempImagePath = path.join(process.cwd(), 'cache', 'currentImage.jpg');

      // حفظ الصورة في المجلد المؤقت
      fs.writeFileSync(tempImagePath, currentImage);

      // رفع الصورة إلى imgBB والحصول على URL
      const newImageUrl = await uploadImgbb(tempImagePath);

      // تحديث بيانات المجموعة
      await Threads.update(threadID, {
        anti: {
          imageBox: status,
          imageUrl: newImageUrl,
        },
      });

      // إرسال رسالة تأكيد
      await api.sendMessage(`تم ${status ? 'تشغيل' : '❌ إطفاء ✅'} ميزة الحماية من تغيير صورة المجموعة`, threadID);

      // حذف الصورة المؤقتة
      fs.unlinkSync(tempImagePath);
    } catch (err) {
      console.error('خطأ أثناء تنفيذ الأمر:', err);
      await api.sendMessage('❌ | لقد حدث خطأ غير متوقع!', event.threadID);
    }
  }
}

export default new AntiboxImage();
