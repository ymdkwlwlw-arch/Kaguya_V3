import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

const KievRPSSecAuth = process.env.KievRPSSecAuth || "FABaBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACFvXJQtAul8EGAQUziyX624Mp4iPvuqLeaRWrYjD9B/6Xb3S4Do/cjiJd3J4d/S79tm8+YBYvvFzXUix0ksBIZN1PGB7ooC3ZCj7rWdKCjMkQTBSwvwYGKVEaKV9s9KhOS7naBQfQMhaIGYmjaC2oIhurCEdP4ORBKkwLtvvl/4rghGuHpW4q6ZAR95okMIrgKhX84q9hR/HykTYXN3loHwmBUBWSG0qrVJEdjmxREcpfjgmOKA2s8rb4C8LTJv9G0zJaOZFpDDEM+ImEtHsm+oh3Q0mI2LZ+EZ4vSx6PHD5IkR90T5ztn+FSU5J3wOXcLJky9Htgz0GaIEU/+dcBwL7zPdzroEcqx/2eogdOMjp+uzzRuNMqGxp5X52eqlmFPkTWUnC4f5LG/cnIg1hoO710bhL6aCF9xkmBnkm3ESn8XOostymf+Srvjn81gSO8cuCunNxPnBqeWveGqc+6TyZTIp70e0Op0YRZLXZyONw2mH1tF2UF3dzYEQsndx6aiA2apS31fXL56wkcsdhibOr1SBWOOrqedhSAHpjfcGNCWiRkqo3sl9vzBoyJnI5lCdNWFQtm/L9Fvfxf7B02Tg0UZvdlgvP/i8HaJkBn2U5hupqQZiBDoEn0o6Wnr2Kj+iAx/kXrs3nRxoM1V8ti62n3/NUvJFZW7sB1LPoYpDBs/FmcFB//G1UNmsWYeMBbtk5nb0/jqxbqw2hRWTxiK+lHU4N8KX9OjAORGVFIIsh+/uz5xRoD7dMoQTPSnhvnvMFzFUlRPOrnlaqqgx9j5AsGXX8X2sWn1U8vmwqhTNgnLywTsDSEei5nKaoTPWtiQkm4t1vdBOebNeQvIBtGt1Hgf77/Sumf5kxtCv3mx3zUqBN1R7Jjjdf4DbUGmSfMtF9rLRjJ2bdm0Ta06ksGEpxnP4s+oWs4EeD4Rs5WgRSn7cs5F95NOuVF5jh5JiSxp27CWbggvXsbIDMt7jGsAM8dXt3gWFr6H5iMlNVqOxm+vL8v92h00g4hHc8NH1Hww7AJKxT6LMJMBealvuYtbMst2YusPTcM8k4pktWIzYliFeShn8kCVITOeauuo+nwdejoWY2IoKYmXEiD8gSlPTijtgFHes6NQfTm4KpwtrD7YFlBl1UoyytWTpiUUVXT/F1OTe7r640zCkMfrATAwib94fEbt/2wTVzf0EYnh2tguLhmI1ZCw+uPAbgEqRgspVXYOjHXEqNjpoWmyYLiAOfaMyHet8or8H1SnGW13WntQmzKxktLnsNT/evL6haoXUSQL2EDC4WrEbUxWBRV0JOTpAhnTwpwRR76ewEuTZVOqlsCqPpPVbCZSwBJOn44xriIFom6HdRsD82yxT3jri5Tn8A7p2pCWiepyNn2eACDwPeAha1WdE3ctzXJZjexzetFACardcCRJB7E5nds56Y5bQliuYbtg==";
const _U = process.env._U || "17wDWwuFK-qacyoiS5gK682-y1RG3AsJEmLGIXGMcxoSZxLjZP1yWmsg29uUXHR5LZMcXzbfXyauxVtyptzwfeCfbziqWAVq5ZVGp04kDXY95F5hISkQVnDfksihBXS4uwfZ2R2c1fsQKHw2GMkJEOekW4ejS9tzbwFTMdst7TH2OfCBtZfYxeYlbiYxLIZFEZryVb2ZmicYaqobJdn6ccg";

export default {
  name: "تخيلي",
  author: "kaguya project",
  cooldowns: 50,
  description: "فم بتوليد ثور بإستخدام الذكاء الإصطناعي dalle",
  role: "member",
  aliases: ["dalle", "دايل"],
  execute: async ({ api, event, args, Economy }) => {

    api.setMessageReaction("⚙️", event.messageID, (err) => {}, true);

const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 100;
      if (userMoney < cost) {
        return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار 💵 لكل صورة تخيلية واحدة`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID)
    
    const prompt = args.join(" ");
    const senderID = event.senderID;

    try {
      const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
      const translatedText = translationResponse?.data?.[0]?.[0]?.[0];

      const res = await axios.get(`https://apis-dalle-gen.onrender.com/dalle3?auth_cookie_U=${encodeURIComponent(_U)}&auth_cookie_KievRPSSecAuth=${encodeURIComponent(KievRPSSecAuth)}&prompt=${encodeURIComponent(translatedText)}`);
      const data = res.data.results.images;

      if (!data || data.length === 0) {
        api.sendMessage("⚠️ | إنتهت كل الكوكيزة الخاصة بتوليد الصور يرجى إنتظار المطور ريثما يقوم بشحن الأمر بكوكيز جديدة من أجل إستعمال هذا الأمر مجددا", event.threadID, event.messageID);
        return;
      }

      const imgData = [];
      for (let i = 0; i < Math.min(4, data.length); i++) {
        const imgResponse = await axios.get(data[i].url, { responseType: 'arraybuffer' });
        const imgPath = path.join(process.cwd(), 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      // استخدام moment-timezone لجلب الوقت والتاريخ
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
          body: `࿇ ══━━━━✥◈✥━━━━══ ࿇\n✅ | تفضل نتيجة الوصف الخاصة بك \nتم التنفيذ من طرف: ${userName}\n⏰ | ❏ الوقت: ${timeString}\n📅 | ❏ التاريخ: ${dateString}\n⏳ | ❏ وقت التنفيذ: ${executionTime} ثانية\n📝 | ❏الوصف: ${prompt}\n࿇ ══━━━━✥◈✥━━━━══ ࿇`
        }, event.threadID, event.messageID);
      }); 

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      api.sendMessage("⚠️ | إنتهت كل الكوكيزة الخاصة بتوليد الصور يرجى إنتظار المطور ريثما يقوم بشحن الأمر بكوكيز جديدة من أجل إستعمال هذا الأمر مجددا", event.threadID, event.messageID);
    }
  }
};
