import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

const KievRPSSecAuth = process.env.KievRPSSecAuth || "FABSBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACD5goXlvtEyrEAR9EpZtNl87G521XDyQxwldHqNCJ84ogxTZ7DcbtEB45W5cJJHlJJODSXi9/Gwt/j9bbnEfEWQAfZFSxORheaBmhFCUtGviURofJTEqRqSgcNfqSxBLO113QmdJIVvLdG8IM7QP21YeB1sBQujZWzfQpx1pwcyNMbXAO8mvEQJ2IsRb7NB+yBvtOjE1u+x/2PTvt/OogO1+mzcYu3ovR/T0IbkR+WMeSOlBU973kyttl+DFNZKqZeTckAWP5hbl1PGBmcBJ1tPutJGiFKpSnn4nhT2Xq6f6qQQE6tPTT/Redv9lXQnXY2w14iMGmy0DVo97Mrd7Z5k7mYE9sja1igq55UNLNu7reX1qRfyiI7roITNiLJG0nAN0H5LNzv/L9TS/iSlxPRlx2ltR8IvEm9nleW+/NBPe40t5eE3YXVANHcBVYrGWGsELeZ5CksQ5bJrbq3Vcp7UdabiYzA9VsA+kjcSfLSwT1WzXiucV/H3Jqj5aZ8F3vhRlsT9dbXpeqwvaM1IrBjnqdOtj73XPGdLh9DtryG4RHWr3cAiLfWLlgwkGM484KNsb25cx0z+3GKYfhsmbLV5uS7LEx/rsdmweAGg9M3/kNKAPN85Mtgm+qx5sOCjIJJv9V6DgNpsgdAN0fMmF8DRvgm/QAKCAVLzuT3oUCdSJwOYFcZncODO9qY1J70tsshTBrm41XYZqlr4K08GQOeZEoU0H1HI+o0wEcLTas3+qTR3N7iLKCrF0ZIIVQt5Ax2dTI4N3kIx8tEAf1dgAqI1lKB5tbqW2MhCl+Tp2WlNCpjt6Q743aSY0Bir+jwhQJsJogqhvJMgNqiV68Lk/HBGnIeo1aakO05qA2SqsKyBHMKNs/i5eMjuFf0qWcOq45vAZDgE3/t7EwVTF8D9TDf2BEbi7z1QUgJL9hNWotXK1uhiVaAoaSZ4AzNBHyBvl1Mbh+0ZT+qByPH8eFKybZd19sxOk59tFNWcCnf3aJLlnk4lgM73CujKEBCmHcddWkSljdE2odG55QiqPmBjJQRK0Y9T2Flua+wZixQ1fZk6od+i/6GQQQHdrStRTetPazLzQtaWGSMN5lJoxFpkC4d/ZtI+269yrnaZQxJ2G/APmi9OtIAvWkeLqKEY/TRgNxx0Z011Dp3+SBITxhXEz5VP7/Sd9RQWjIhs1A14YXFHMukrdto/sTGdxJfZ5g35TTC/M1rbW0WyYUSyLJUF6zKIg6cDB4gnPlI8KbuNwSd2196oslKGjHGou4nG07wlga5khjyBXqiT3drA+jrQCG+dL17tj1hdB9jE/6SrR2rhCjTnaRTle1nGeGeb/2klSdvJF/fyvo6kmcy3AjTA5JobBPwd0KnvuFeYGrCfeCT0Mcc+XWafoeUWUXhQAAUuwimeUuMKhf+SnCguwzmD9qqk=";
const _U = process.env._U || "11olBFTkuAKFHIDlouVZjzVUXnCeW3WvSbYaJSPuBYfePA7yoHV57KmikU68S3BB6dOw-OuZEfpBivg7jPAKHm7mWWXTDOnSeDQPIKeAaYFpzpYZTOaHcCYGMXkSHlQG1_C1riGsxTT3xpMWGMynXodbWbfGGAmzjy7-YzhZjgd-tTkeYanVzXdwCwEIGIkM-V7t1b5hFH5SoKbd3qredcQ";

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
          body: `࿇ ══━━✥◈✥━━══ ࿇\n✅ | تفضل نتيجة الوصف الخاصة بك \nتم التنفيذ من طرف: ${userName}\n⏰ | ❏ الوقت: ${timeString}\n📅 | ❏ التاريخ: ${dateString}\n⏳ | ❏ وقت التنفيذ: ${executionTime} ثانية\n📝 | ❏الوصف: ${prompt}\n࿇ ══━━✥◈✥━━══ ࿇`
        }, event.threadID, event.messageID);
      }); 

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      api.sendMessage("⚠️ | إنتهت كل الكوكيزة الخاصة بتوليد الصور يرجى إنتظار المطور ريثما يقوم بشحن الأمر بكوكيز جديدة من أجل إستعمال هذا الأمر مجددا", event.threadID, event.messageID);
    }
  }
};
