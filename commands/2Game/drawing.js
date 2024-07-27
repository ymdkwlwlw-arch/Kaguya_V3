import axios from "axios";
import fs from "fs-extra";
import path from "path";
import moment from "moment-timezone";

const KievRPSSecAuth = process.env.KievRPSSecAuth || "FACCBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACCjkFrYUe1VMQAT4dMET3xVdE89NAbpkg2BwQvYYYj9OwPFJBwDN5rmbufTKLBrpD5SdkMyiUuNWeO2Y1+oSHIgT5d4PBrJFrFQgKNWFiNoxyxCVqnNFiwFvF8npxjgD8D56/AGlOo0rUX4pvpBhWE81VR5MWBPZWawr11hSIAW9YV/YMej8P6uu0FR6kuZiqKuLcGqkD84HZAk0MQd287RFPhuCFcKHPwlMdW76twIfCi3RDKuikr/8GQwo9hGhupo6D+2nthaW5RvcbK0GPUlYcg4ncHjL2cGDLSck8Dm9hOoSUb6zTruB0fdn5UUhiIsH10o1yWhDqhcssEEBc9tDa0tMnfRWBnVP2yrT6gMKw9bKxRg4sFP5sox/7jOD/W4YgSh7IIQFU1LYxqtzbf1uT9Ce1Z8WSO7HSXt1taYAbDjnq1AkLeUMBkdQ8WuVljN5/egPugdLJSa0lREYxMapxyJwrP9Uy1p5kV/2Ji7U38zI8gWt/mpdLmEpulIlSAhU2OXg/weDdkrn72FkGt5EkX27jqgJ/owQ/7wOITzQwNW7UfKqwsHOmrP3I67nn+8nV6ndFuqRzuBAWsloYC0rFG6RNqqZbY1p3OngRE2bYlSUo7ShcmB09cuWKWL3GgkomZFncJuOWsFbqf5ADo21lJvPoXr/kp/jSrQWSnx+LiWR9Kl/nQXLf0L9rCJMYGto7yrli4VnoRRUHKlFMkG7E+0AODcdcGE71f56w01jBRcG4BEidZuaDCFSdlB3UNOBeFz9afz4MGxdk6ieHoxrhp9S1hMcNH9faskFVioUKpKcK1KzBX4emOk0+TPWRtWyxC5VAVzUWuLcrICyxZM61w/ld6KyXbQDJIORYwMYTsgcQud9/Pl3h8Td+Vlo7deXDraoqr+pdt0acZjCeMEmdk+UGoSouHZZ+48EnJm6AO/pZVgMqhLd2s3fE368tP3mfJoqEPGK9aU9drpA12V6vrYqY/aNTqyVumY4bkQqo3fK7QQrg3vmbXLUp5vFkiAIonAT24d5NFlmnBj3jKaZ8oVvVQ4A9JhYKHGj6W1S8q6GXMIXewtL3o+ykqLa4regLOXM45w1LYebeSrztMxrBIPWNRJG6yoKP1OP8A6zxrWHZcCzRsBDzkdwNz7Lku9Indho1XoB5u6RZGm35kBczR3gtla67fnz16mossqMJ+INJilnfNB/fZzaAE5l9X8fTgtcNrI9qBLBNQ61V7HNzsc/CHDlqzmsJxO5reaD7xh1+g4lbfnk15XHRLg1As8D3CjjRNikfOvt13Vp0utxSxYoaeRdJR++rl0GcGDoBiEG4qb8yjkWIv6i6qcTDNBgTGpB85Goa/rTsBvQuMaFQHlTzWB1d8jOKq8eBz8JIM+cfjTXi1WPy+WQMI4yPdKHZYj7ZSgF5Ad/9yzpay+VZIHe9LqBfLBTbOlPSebaDqzlLWHrgIciqRQA96jsYzDq42VqQLTxdqoaDBJteH4=";
const _U = process.env._U || "1KywvMgBeLeAt-XjqMqa7E7wiMYcxG5nIyQVIqh28XCldZxoDkiJavrdV0GF6oCUhlQZWXicQsUD4ynYDa9XaU-y_gqeuuJGYfmchjMln4jtDF22QKfjzi9nnhO8idSuO_jjIWH5GxghyZ2NOB1D0HKTc8S4somps9HviDDrXYbi_aJsN9hUyDHFBF2kwEsybS4nyfseax32rs3MOrX95ba1sWR_Cmb1wD-r1hQXYbOs";

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
