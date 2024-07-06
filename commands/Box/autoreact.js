import axios from "axios";
import global from "global"; // تأكد من وجود هذا الاستيراد للحصول على المتغير global

export default {
  name: "ذكاء",
  author: "kaguya project",
  role: "member",
  description: "استخدام ChatGPT للرد على الاستفسارات.",

  execute: async ({ api, event, args }) => {
    try {
      const Prefixes = ["*", "/", "؟"]; // تأكد من تحديد البادئات الصحيحة
      const prefix = Prefixes.find((p) => event.body && event.body.toLowerCase().startsWith(p));
      if (!prefix) {
        return; // Invalid prefix, ignore the command
      }

      const prompt = event.body.substring(prefix.length).trim();
      if (!prompt) {
        api.sendMessage("💬 𝗖𝗵𝗮𝘁𝗚𝗣𝗧\n\nاهلا كيف يمكنني مساعدتك ؟ ☺️", event.threadID, event.messageID);
        return;
      }

      api.setMessageReaction("⏰", event.messageID, (err) => {}, true);
      const response = await axios.get(`https://joshweb.click/new/gpt-4_adv?prompt=${encodeURIComponent(prompt)}`);
      const answer = response.data.result.reply; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح

      api.sendMessage(answer, event.threadID, (err, info) => {
        if (err) return console.error(err);

        global.client.handler.reply.set(info.messageID, {
          author: event.senderID,
          type: "reply",
          name: "ذكاء",
          unsend: false,
        });
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    } catch (error) {
      console.error("Error:", error.message, error.response?.data);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.sendMessage("⚠️ حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ api, event, reply, Economy, Users }) => {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        const response = await axios.get(`https://joshweb.click/new/gpt-4_adv?prompt=${encodeURIComponent(event.body)}`);
        const answer = response.data.result.reply; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح
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
