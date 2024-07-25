import axios from "axios";

export default {
  name: "ذكاء",
  author: "kaguya project",
  role: "member",
  description: "استخدام Bing للرد على الاستفسارات.",

  execute: async ({ api, event, client }) => {
    try {
      const { threadID, messageID, body, senderID } = event;

      api.setMessageReaction("⏰", messageID, (err) => {}, true);

      // إرسال الطلب إلى API Bing
      const response = await axios.get(`https://joshweb.click/bing?prompt=${encodeURIComponent(body)}`);
      const answer = response.data.bing; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح

      api.sendMessage(answer, threadID, (err, info) => {
        if (err) return console.error(err);

        global.client.handler.reply.set(info.messageID, {
          author: senderID,
          type: "reply",
          name: "ذكاء",
          unsend: false,
        });
      });

      api.setMessageReaction("✅", messageID, (err) => {}, true);

    } catch (error) {
      console.error("Error:", error.message, error.response?.data);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage("⚠️ حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, reply, client }) => {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        // إرسال الرد إلى API Bing
        const response = await axios.get(`https://joshweb.click/bing?prompt=${encodeURIComponent(event.body)}`);
        const answer = response.data.bing; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح

        api.sendMessage(answer, event.threadID, (err, info) => {
          if (err) return console.error(err);

          // تحديث replyId للرد الجديد
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "reply",
            name: "ذكاء",
            unsend: false,
          });
        });
      } catch (error) {
        console.error("Error:", error.message, error.response?.data);
        api.sendMessage("⚠️ حدث خطأ أثناء معالجة ردك. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
      }
    }
  }
};
                             
