import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

export default {
  name: "تخيلي",
  author: "kaguya project",
  cooldowns: 50,
  description: "قم بتوليد صور باستخدام الذكاء الاصطناعي DALL·E",
  role: "member",
  aliases: ["تخيل", "imagine"],
  execute: async ({ api, event, args, Economy }) => {

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    // التحقق من وجود برومبت
    if (args.length === 0) {
      return api.sendMessage("⚠️ | من فضلك أدخل البرومبت الذي تود استخدامه لتوليد الصورة.", event.threadID, event.messageID);
    }

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    const prompt = args.join(" ");
    const senderID = event.senderID;

    try {
      // ترجمة البرومبت إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      // استدعاء الـ API الجديد مع البرومبت المترجم
      const res = await axios.get(`https://samirxpikachuio.onrender.com/bflux?prompt=${encodeURIComponent(translatedText)}`);
      const imageUrl = res.data.imageUrl;

      if (!imageUrl) {
        return api.sendMessage("⚠️ | لم يتم توليد أي صور بناءً على المدخلات التي قدمتها.", event.threadID, event.messageID);
      }

      // تحميل الصورة وحفظها محليًا
      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imgPath = path.join(process.cwd(), 'cache', `generated_image_${Date.now()}.png`);
      await fs.outputFile(imgPath, imgResponse.data);

      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      // الحصول على معلومات المستخدم
      api.getUserInfo(senderID, async (err, userInfo) => {
        if (err) {
          console.log(err);
          return;
        }
        const userName = userInfo[senderID].name;

        // إرسال الرسالة مع الصورة
        await api.sendMessage({
          attachment: fs.createReadStream(imgPath),
          body: `\t\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`
        }, event.threadID, event.messageID);

        // حذف الصورة المؤقتة بعد الإرسال
        fs.unlink(imgPath, (err) => {
          if (err) console.error('Error deleting the file:', err);
        });
      });

      // تفاعل النجاح
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};
