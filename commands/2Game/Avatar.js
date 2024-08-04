import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';

export default {
  name: "اڤتار",
  author: "Kaguya Project",
  role: "user",
  description: "Generates a custom avatar with specified parameters.",
  execute: async ({ api, event, args }) => {
    try {
      // دمج كافة المعلمات الواردة
      const input = args.join(" ");
      const [id, bgtext, signature, color] = input.split(" | ");

      // التحقق من صحة جميع المعلمات المطلوبة
      if (!id || !bgtext || !signature || !color) {
        return api.sendMessage("⚠️ | أدخله على هذه الشاكلة لاتنسى الأسماء بالإنجليزية : رقم من 1 الى 800 | نص الخلفية  | المعرف | اللون.", event.threadID);
      }

      // بناء URL API مع المعلمات المقدمة
      const apiUrl = `https://ggwp-yyxy.onrender.com/canvas/avatarv2?id=${encodeURIComponent(id)}&bgtext=${encodeURIComponent(bgtext)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

      // إرسال رسالة بأن الصورة قيد التحضير
      api.sendMessage(" ⏱️ | جاري توليد الأڤتار الحاص بك , يرجى الإنتظار...", event.threadID);

      // الحصول على الصورة من API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const avatarPath = path.join(process.cwd(), "cache", "avatar.jpg"); // تحديد المسار باستخدام process.cwd()

      // حفظ الصورة إلى المسار المحدد
      await fs.writeFile(avatarPath, response.data);

      // إرسال الصورة والرسالة
      await api.sendMessage({
        body: "✅ | تم بنجاح",
        attachment: fs.createReadStream(avatarPath),
      }, event.threadID);

      // حذف الصورة المؤقتة بعد إرسالها
      await fs.unlink(avatarPath);
    } catch (error) {
      console.error('Error:', error);
      api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
  }
};
