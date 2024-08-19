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
  aliases: ["dalle", "دايل"],
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
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      const res = await axios.get(`https://c-v1.onrender.com/flux/v1?prompt=${encodeURIComponent(translatedText)}`);
      const data = res.data.data.output;

      if (!data || data.length === 0) {
        return api.sendMessage("⚠️ | لم يتم توليد أي صور بناءً على المدخلات التي قدمتها.", event.threadID, event.messageID);
      }

      const imgData = [];
      for (let i = 0; i < Math.min(4, data.length); i++) {
        const imgResponse = await axios.get(data[i], { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.png`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      const now = moment().tz("Africa/Casablanca");
      const timeString = now.format("HH:mm:ss");
      const dateString = now.format("YYYY-MM-DD");
      const executionTime = ((Date.now() - event.timestamp) / 1000).toFixed(2);

      api.getUserInfo(senderID, async (err, userInfo) => {
        if (err) {
          console.log(err);
          return;
        }
        const userName = userInfo[senderID].name;

        await api.sendMessage({
          attachment: imgData,
          body: `\t\t\t\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t\t\t 〘تـم تـولـيـد الـصورة بـنجـاح〙  \n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime} ثانية\n📝 | ❏ الـبـرومـبـت : ${prompt}\n 🔖 | تم خصم 
〘${cost}〙دولار 💵\n\t\t\t\t࿇ ══━━✥◈✥━━══ ࿇`
        }, event.threadID, event.messageID);
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
    }
  }
};
