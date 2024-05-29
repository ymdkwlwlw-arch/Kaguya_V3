import axios from 'axios';

export default {
  name: "ترجمة",
  author: "kaguya project",
  cooldowns: 10,
  description: "ترجمة النص من لغة إلى أخرى باستخدام خدمة Google Translate.",
  role: "member",
  aliases: ["translate", "ترجمي"],
  execute: async ({ api, event, args }) => {
    const request = axios.create();
    const content = args.join(" ");

    if (content.length === 0 && event.type !== "message_reply") {
      api.sendMessage("يرجى كتابة النص الذي تريد ترجمته.", event.threadID);
      return;
    }

    let translateThis, lang;
    if (event.type === "message_reply") {
      translateThis = event.messageReply.body;
      lang = content.includes("->") ? content.split("->")[1].trim() : 'ar'; // تعيين اللغة الافتراضية إلى العربية 'ar'
    } else {
      const indexOfArrow = content.indexOf("->");
      if (indexOfArrow !== -1) {
        translateThis = content.slice(0, indexOfArrow).trim();
        lang = content.slice(indexOfArrow + 2).trim();
      } else {
        translateThis = content;
        lang = 'ar'; // تعيين اللغة الافتراضية إلى العربية 'ar'
      }
    }

    try {
      const response = await request.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(translateThis)}`);
      const translationData = response.data;

      // Extract translated text from the response
      let translatedText = '';
      translationData[0].forEach(item => {
        if (item[0]) {
          translatedText += item[0];
        }
      });

      // Determine source language
      const fromLang = (translationData[2] === translationData[8][0][0]) ? translationData[2] : translationData[8][0][0];

      api.sendMessage(`🌐 الترجمة : ${translatedText}\n- تمت الترجمة من ${fromLang} إلى ${lang}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء عملية الترجمة.", event.threadID);
    }
  },
};