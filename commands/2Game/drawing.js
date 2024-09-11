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

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 100;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
    }

    await Economy.decrease(cost, event.senderID);

    // طلب من المستخدم اختيار نموذج بين 1 و 55
    return api.sendMessage("🎨 | من فضلك قم بإدخال رقم النموذج (بين 1 و 55):", event.threadID, event.messageID, (err, info) => {
      if (err) return console.error(err);
      
      global.client.handler.reply.set(info.messageID, {
        author: event.senderID,
        type: "pickModel",
        name: "تخيلي",
        unsend: true
      });
    });
  },

  onReply: async ({ api, event, reply }) => {
    // الرد الأول لاختيار النموذج
    if (reply.type === "pickModel" && event.senderID === reply.author) {
      const choice = event.body.trim().toLowerCase();

      // التحقق من أن الاختيار رقم صحيح بين 1 و 55
      if (!isNaN(choice) && Number(choice) >= 1 && Number(choice) <= 55) {
        // طلب الوصف بعد اختيار النموذج
        return api.sendMessage("✔️ | تم إدخال وحفظ النموذج \n💬 | أدخل الوصف الآن لتوليد الصورة:", event.threadID, (err, info) => {
          if (err) return console.error(err);

          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "description",
            name: "تخيلي",
            model: choice, // تخزين النموذج المختار
            unsend: true,
          });
        });
      } else {
        return api.sendMessage("⚠️ | الرجاء إدخال رقم صحيح بين 1 و 55.", event.threadID, event.messageID);
      }
    }

    // الرد الثاني لإدخال الوصف
    else if (reply.type === "description" && event.senderID === reply.author) {
      const description = event.body.trim();

      if (description.length === 0) {
        return api.sendMessage("⚠️ | الرجاء إدخال وصف صالح.", event.threadID, event.messageID);
      }

      // توليد الصورة باستخدام الوصف والنموذج المختار
      try {
        const res = await axios.get(`https://smfahim.xyz/prodia?prompt=${encodeURIComponent(description)}&model=${reply.model}`);
        const data = res.data.data.output;

        if (!data || data.length === 0) {
          return api.sendMessage("⚠️ | لم يتم توليد أي صور بناءً على المدخلات التي قدمتها.", event.threadID, event.messageID);
        }

        // تحميل الصورة
        const imgResponse = await axios.get(data[0], { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', 'generated_image.png');
        await fs.outputFile(imgPath, imgResponse.data);

        // إعداد الرسالة المرفقة بالصورة
        const now = moment().tz("Africa/Casablanca");
        const timeString = now.format("HH:mm:ss");
        const dateString = now.format("YYYY-MM-DD");

        // إرسال الصورة مع التفاصيل
        return api.getUserInfo(event.senderID, async (err, userInfo) => {
          if (err) return console.error(err);
          const userName = userInfo[event.senderID].name;

          await api.sendMessage({
            attachment: fs.createReadStream(imgPath),
            body: `\t\t\t࿇ ══━━✥◈✥━━══ ࿇\n\t\t〘تـم تـولـيـد الـصورة بـنجـاح〙\n 👥 | مـن طـرف : ${userName}\n⏰ | ❏الـتـوقـيـت : ${timeString}\n📅 | ❏الـتـاريـخ: ${dateString}\n\t\t࿇ ══━━✥◈✥━━══ ࿇`
          }, event.threadID, () => {
            // حذف الصورة من الكاش بعد إرسالها
            fs.unlinkSync(imgPath);
          });
        });

      } catch (error) {
        console.error(error);
        return api.sendMessage("⚠️ | حدث خطأ أثناء توليد الصورة. حاول مرة أخرى لاحقًا.", event.threadID, event.messageID);
      }
    }
  }
};
