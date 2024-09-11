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
  
  execute: async function ({ api, event, args, Economy }) {
    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

    // التحقق من وجود البرومبت والفاصل |
    if (args.length === 0 || !args.includes("|")) {
      return api.sendMessage("⚠️ | من فضلك أدخل النموذج والوصف مفصولين بـ |. مثال: 3 | وصف الصورة", event.threadID, event.messageID);
    }

    // فصل النموذج والوصف
    const input = args.join(" ").split("|").map(item => item.trim());
    const model = input[0];
    const prompt = input[1];

    // التحقق من أن النموذج رقم صحيح بين 1 و 55
    if (isNaN(model) || Number(model) < 1 || Number(model) > 55) {
      return api.sendMessage("⚠️ | الرجاء إدخال رقم نموذج صحيح بين 1 و 55.", event.threadID, event.messageID);
    }

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    try {
      // الترجمة من العربية إلى الإنجليزية
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0] || prompt;

      // استخدام API مع النموذج المختار
      const apiUrl = `https://smfahim.xyz/prodia?prompt=${encodeURIComponent(translatedText)}&model=${model}`;
      const response = await axios.get(apiUrl, { responseType: 'json' });

      const outputData = response?.data?.data?.output;
      if (!outputData || outputData.length === 0) {
        return api.sendMessage("⚠️ | لم يتم توليد أي صور بناءً على المدخلات التي قدمتها.", event.threadID, event.messageID);
      }

      const imgData = [];
      for (let i = 0; i < Math.min(4, outputData.length); i++) {
        const imgUrl = outputData[i];
        const imgResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.png`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      api.getUserInfo(event.senderID, async (err, userInfo) => {
        if (err) {
          console.log(err);
          return;
        }
        const userName = userInfo[event.senderID].name;

        await api.sendMessage({
          attachment: imgData,
          body: `\t\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\nنموذج: ${model}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`
        }, event.threadID, () => {
          // حذف الصور المؤقتة بعد إرسالها
          imgData.forEach(file => fs.unlinkSync(file.path));
        }, event.messageID);
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      console.error("خطأ أثناء معالجة الطلب:", error);
      api.sendMessage("⚠️ | حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};
