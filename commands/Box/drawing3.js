import axios from "axios";
import fs from "fs";
import path from "path";

const __dirname = path.resolve();

export default {
  name: "بنتريست",
  author: "Arjhil Dacayanan",
  cooldowns: 10,
  description: "image search",
  role: "member",
  aliases: ["صور"],

  execute: async ({ api, event, args }) => {
    if (args.length === 0) {
      return api.sendMessage(
        '⚠️ | الرجاء إدخال كلمة للبحث عنها، مثال: "بنتريست او صور ناروتو - 9"',
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction('⏱️', event.messageID, (err) => {}, true);
    
    let keySearch = args.join(" ");
    
    // تحقق إذا كان النص باللغة العربية وقم بترجمته إلى الإنجليزية
    if (/[\u0600-\u06FF]/.test(keySearch)) {
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(keySearch)}`);
      keySearch = translationResponse?.data?.[0]?.[0]?.[0] || keySearch;
    }
    
    // استخراج الجزء المطلوب للبحث وعدد الصور المطلوبة
    const keySearchs = keySearch.split("-")[0].trim();
    const numberSearch = parseInt(keySearch.split("-").pop()) || 9;

    // استدعاء API للحصول على الصور
    const res = await axios.get(
      `https://www.noobs-api.000.pe/dipto/pinterest?search=${encodeURIComponent(keySearchs)}&limit=${numberSearch}`
    );

    const data = res.data.data;
    const imgData = [];

    // تحميل الصور وحفظها في مجلد cache
    for (let i = 0; i < numberSearch; i++) {
      const imagePath = path.join(__dirname, `cache/${i + 1}.jpg`);
      const getDown = (
        await axios.get(`${data[i]}`, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(imagePath, Buffer.from(getDown, "utf-8"));
      imgData.push(fs.createReadStream(imagePath));
    }

    // إرسال الصور في رسالة
    api.sendMessage(
      {
        attachment: imgData,
        body: ` 🔖 | عــدد الـصـور : ${numberSearch} \n📋 | الـبـرومـبـت : ${keySearchs}`,
      },
      event.threadID,
      event.messageID
    );

    api.setMessageReaction('✅', event.messageID, (err) => {}, true);

    // حذف الملفات المؤقتة من مجلد cache
    for (let i = 0; i < numberSearch; i++) {
      fs.unlinkSync(path.join(__dirname, `cache/${i + 1}.jpg`));
    }
  },
};
