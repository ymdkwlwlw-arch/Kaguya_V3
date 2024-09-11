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
      return api.sendMessage("⚠️ | من فضلك قم بالرد على هذه الرسالة وأدخل نموذج (بين 1 و 55) لاستخدامه لتوليد الصورة.", event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "pick",
          unsend: true,
        });
      });
    }
  },
  
  onReply: async ({ api, event, reply, Economy }) => {
    // التأكد من أن المستخدم هو نفس الشخص الذي أرسل الأمر الأصلي
    if (event.senderID !== reply.author) return;

    if (reply.type === "pick") {
      const modelNumber = parseInt(event.body.trim());

      if (isNaN(modelNumber) || modelNumber < 1 || modelNumber > 55) {
        return api.sendMessage("⚠️ | أدخل رقم نموذج صحيح بين 1 و 55.", event.threadID, event.messageID);
      }

      api.sendMessage("💬 | أدخل الآن الوصف الذي تود استخدامه لتوليد الصورة:", event.threadID, (err, info) => {
        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "prompt",
          modelNumber,
          unsend: true,
        });
      });

    } else if (reply.type === "prompt") {
      const prompt = event.body.trim();

      if (!prompt) {
        return api.sendMessage("⚠️ | أدخل وصف صحيح لتوليد الصورة.", event.threadID, event.messageID);
      }

      const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 100;

      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
      }

      await Economy.decrease(cost, event.senderID);

      const senderID = event.senderID;
      const modelNumber = reply.modelNumber;

      try {
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
        const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

        const res = await axios.get(`https://smfahim.xyz/prodia?prompt=${encodeURIComponent(translatedText)}&model=${modelNumber}`);
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
            body: `\t\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n⏳ | ❏الوقـت الـمـسـتـغـرق: ${executionTime}s\n📝 | ❏الـبـرومـبـت : ${prompt}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`
          }, event.threadID, event.messageID);

          // تنظيف الملفات المؤقتة
          for (let i = 0; i < imgData.length; i++) {
            const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.png`);
            fs.unlinkSync(imgPath);
          }

          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        });

      } catch (error) {
        console.error(error);
        api.sendMessage("⚠️ | حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
      }
    }
  }
};
