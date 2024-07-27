import axios from 'axios';
import fs from 'fs-extra';
import moment from 'moment-timezone';

export default {
  name: "بنتريست",
  author: "kaguya project",
  cooldowns: 30,
  description: "البحث عن الصور في بينتيرست باستخدام الكلمة الرئيسية المحددة وعرض عدد معين من النتائج.",
  role: "member",
  aliases: ["بانتريس"],
  execute: async ({ api, event, args }) => {

    api.setMessageReaction("🔎", event.messageID, (err) => {}, true);

    try {
      const keySearch = args.join(" ");
      if (!keySearch.includes("-")) {
        return api.sendMessage('💎 | الرجاء إدخال النص بالشكل الصحيح، مثال: بنتريست ناروتو - 10 (تعتمد على عدد الصور التي تريد ظهورها في النتيجة)', event.threadID, event.messageID);
      }

      const keySearchs = keySearch.substr(0, keySearch.indexOf('-'));
      const numberSearch = keySearch.split("-").pop() || 6;

      // ترجمة الاستعلام من العربية إلى الإنجليزية
      const translatedQuery = await translateToEnglish(keySearchs);

      // البحث عن الصور
      const apiUrl = `https://nash-api-end.onrender.com/pinterest?search=${encodeURIComponent(translatedQuery)}`;
      const res = await axios.get(apiUrl);
      const images = res.data.data; // تحديث هنا لاستخدام البيانات الجديدة
      const imgData = [];

      for (let i = 0; i < Math.min(parseInt(numberSearch), images.length); i++) {
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        const imgResponse = await axios.get(images[i], { responseType: 'arraybuffer' });
        await fs.outputFile(imgPath, imgResponse.data);

        imgData.push(fs.createReadStream(imgPath));
      }

      const timestamp = moment.tz("Africa/Casablanca");
      const dateString = timestamp.format("YYYY-MM-DD");
      const timeString = timestamp.format("HH:mm:ss");

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      await api.sendMessage({
        attachment: imgData,
        body: `✿━━━━━━━━━━━━━━━━━✿\n✅ | تم التحميل بنجاح \nعدد الصور 💹 : ${numberSearch} \nالمراد البحث عنه  : ${keySearchs}\n📆 | التاريخ : ${dateString}\n⏰ | الوقت : ${timeString}\n✿━━━━━━━━━━━━━━━━━✿`
      }, event.threadID, event.messageID);

      // حذف الملفات المؤقتة
      for (let i = 1; i <= Math.min(parseInt(numberSearch), images.length); i++) {
        fs.unlinkSync(path.join(process.cwd(), 'cache', `${i}.jpg`));
      }
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى في وقت لاحق.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  }
};

async function translateToEnglish(query) {
  try {
    const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(query)}`);
    const translatedQuery = translationResponse?.data?.[0]?.[0]?.[0];
    return translatedQuery || query; // استخدام النص الأصلي إذا لم يتم العثور على ترجمة
  } catch (error) {
    console.error('حدث خطأ أثناء ترجمة النص:', error);
    return query; // استخدام النص الأصلي في حالة حدوث خطأ
  }
}
