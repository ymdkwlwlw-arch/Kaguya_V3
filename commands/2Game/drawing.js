import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

const KievRPSSecAuth = process.env.KievRPSSecAuth || "FABSBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACDalap+5zJQvEAQMVjFVX/6L1ANQ8ctgzmNTRXwZUFICWlsgEale//08F86lkFzXKBsL/Jyi4acSnIwDtYaLERVKc4vIThIXLLsogoqBL+H1IXK39DJ3OynZ+Hyr60rT7y2qLU74euZrvbToqnxiMXZ1AjlslCEvl9TgjQXYSlUG4g1jhkUERv7w7PVZ4FTlScmavp4pdRAR19TGRtgdnFYBbCDlYFqyn82m8fJ13YYNWMH/Iw9xt822NdTSNjFM5UhafM1LtigU02UZV1XvIh97bdvNLaYk+NHm8OSZUyqhskMID8x4/kZvhgWYb0fVSlRsCcUv5/0r7kjLyuqTnMbTrdDJyEQ2Iz9ss7uMxFHat2PmcDh6uber3Grgy+JfycOO85p6zLmOq4ShBLNoDH+6gYXc4lOw0B2pPM65Ss4xTirnUstN+a4cmK9NLb9t0qUQdzmWGcQkT14ykgL2lAzMLq6ooXOJVLg35WMekGCl9iKJkxl7NbU7E5hbBiEa0XHRkTJa4/2N3i1O71+I2Z7DVbsr1dzIUChSZChatZPWiQ5UEfRMb1+qqV4u9dpusjKX1QCT69saHDt9dr1weT5r5N3I/V/QQlSu7pTlp7wUKiVB+W5jWLbOLyVgK36jeyU72bBruv6ZhVzfAJj377pgRDLsIG4pFxu1U6KRgqLXFI9jPMpBGXKIJQDEpqPbgyNmWD5K2gMKXrM4EYQY9qMbpFy7F+WZAvdkbKudik0LMlvwjrjJ8rBeeNUbnxyTwjtJs1Z0JetNBYmrbLpkVzqg4xqKtUHYaAGRvYYcsHZnPk+iCWPOzQRO6wiV38ChnIawp6BVA8kDkX6nstqKYHwagUVzqtJWE+VB8Fqhe6nbAdf3PNspmGiP+BLcAkqdE6R3pivsjsB5XUaP4NtH4mSUlJJAydtp1iikYjormbR0L+Ym80i7IO4wBtDJv641sXtaaxNATupBupjdpFe4TW6i1+F4RSJ2ybh44UI/ltgJSr0nI/UtZTWVFJyuwTS4ni5E+0oDblIjgxmwqkoB7TAdImUcZWR1agZgTu6fUj4OQjb82az80E9MDZWv359JzhQ8GYT/vd0Ved+h73MJW9yt1/dpI4PLq7od3cNDfmJU/CHzLVm4mklUEBqoyns9zkE88o9Gy1X3DHYTADsjEl6ZDYRJ+K01GQD3nV487ziE2LhDo6Np/Tppk132XNmFTicEqRr/5PIlG4RnU9a+RKsedrbSCtLKJPN460LunfiHbGrMtmPaC4PT0sOWPl7Io0isRCTzFsthJhceAL3yuHrsZ5K3FjvJZev+EgxTG9G05E139fCPfDv7ppjMgKO+z7Eb9H/uK7zoio6dNEqS0mPm563wBphpgCBhwHRJL7raqdi2b0GeANWQ3hQAGrxlkPSAiQXGY7bPyCqN11QYwAI=";
const _U = process.env._U || "1DjqmGIDDyJd2eElnmolsgFRr03ITNU7WuZTgjPFctQsdsqKLnWockBt_0ZYvFJ4-G0MzbyTp7drh5r7kujHPZ3-w2KzCCRS_etbF4A4rMiSl9q15JQVfLUXt1VyiUyPALdbuP1wipaXHKVk7EJNUfFPdhRDZyb1T3r_CF2a32V1YrjpuuchgxspOUVbKzCVIgttuhKqmA-1wzorCIwqCcw";

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
          body: `✿━━━━━━━━━━━━━━━━━✿\n✅ | تفضل نتيجة الوصف الخاصة بك \nتم التنفيذ من طرف: ${userName}\n⏰ | ❏ الوقت: ${timeString}\n📅 | ❏ التاريخ: ${dateString}\n⏳ | ❏ وقت التنفيذ: ${executionTime} ثانية\n📝 | ❏الوصف: ${prompt}\n✿━━━━━━━━━━━━━━━━━✿`
        }, event.threadID, event.messageID);
      }); 

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      api.sendMessage("⚠️ | إنتهت كل الكوكيزة الخاصة بتوليد الصور يرجى إنتظار المطور ريثما يقوم بشحن الأمر بكوكيز جديدة من أجل إستعمال هذا الأمر مجددا", event.threadID, event.messageID);
    }
  }
};