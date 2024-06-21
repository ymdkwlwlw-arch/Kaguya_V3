import axios from "axios";
import global from "global"; // تأكد من وجود هذا الاستيراد للحصول على المتغير global

export default {
  name: "كشف",
  author: "kaguya project",
  role: "admin",
  description: "يكشف ويزيل البوتات بناءً على المؤشرات المحددة في الرسائل.",

  execute: async ({ api, event, args }) => {
    const threadID = event.threadID;
    const detectedBots = new Set();
    let detecting = true;

    api.sendMessage('بدء كشف البوتات. سيتم مراقبة الرسائل لمدة 10 دقائق...', threadID);

    // إيقاف الكشف بعد 10 دقائق
    setTimeout(() => {
      detecting = false;

      if (detectedBots.size > 0) {
        detectedBots.forEach(botID => {
          api.removeUserFromGroup(botID, threadID, (err) => {
            if (err) {
              console.error(`فشل في إزالة البوت ${botID}:`, err);
            } else {
              api.sendMessage(`تم إزالة البوت المكتشف: ${botID}`, threadID);
            }
          });
        });
      } else {
        api.sendMessage('لم يتم كشف أي بوتات خلال فترة المراقبة.', threadID);
      }
    }, 10 * 60 * 1000);

    // الاستماع للرسائل والردود على الرسائل
    api.listenMqtt((err, event) => {
      if (err) {
        console.error('خطأ في الاستماع للأحداث:', err);
        return;
      }

      if (detecting && event.threadID === threadID && (event.type === 'message' || event.type === 'message_reply')) {
        // كشف الرسائل التي قد تشير إلى وجود بوت
        const botIndicators = [
          "command not found",
          "does not exist",
          "no prompt provided",
          "invalid command"
        ];

        const message = event.body.toLowerCase();

        if (botIndicators.some(indicator => message.includes(indicator))) {
          detectedBots.add(event.senderID);
          console.log(`تم كشف رسالة بوت من المستخدم ${event.senderID}: ${event.body}`);
        }
      }
    });
  }
};
