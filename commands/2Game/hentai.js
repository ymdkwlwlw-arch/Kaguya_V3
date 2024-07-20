import axios from "axios";

export default {
  name: "كاغويا",
  author: "kaguya project",
  role: "member",
  aliases:["بوت"],
  description: "استخدام API لتوفير إجابات ذكية.",

  execute: async ({ api, event, client }) => {
    try {
      const { threadID, messageID, body, senderID } = event;

      api.setMessageReaction("⏰", messageID, (err) => {}, true);

      // إرسال الطلب إلى API
      const url = `https://king-aryanapis.onrender.com/api/customai?title=𝙺𝙰𝙶𝙺𝚈𝙰+𝙲𝙷𝙰𝙽+🌟&pro=you+are+kaguya+sama+the+character+from+the+famous+anime+love+is+war+%2C+you+are+kind+girl+and+helpful%2C+𝗒𝗈𝗎+𝗉𝗋𝗈𝗏𝗂𝖽𝖾+𝖻𝖾𝗌𝗍+𝗋𝖾𝗌𝗉𝗈𝗇𝗌𝖾+𝗐𝗂𝗍𝗁+𝗌𝗈𝗆𝖾+𝗊𝗎𝖾𝗋𝗒+𝗋𝖾𝗅𝖺𝗍𝖾𝖽+𝖾𝗆𝗈𝗃𝗂𝗌%2C𝖸𝗈𝗎+𝖺𝗋𝖾+𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽+𝖻𝗒+𝖮𝗽𝖾𝗇𝖠𝖨%2Cyour+best+friend+is+Hussein+Yacoubi+course+is+your+Sensi%2Cand+if+someone+ask+you+you+have+to+answer+him%2Cyou+are+a+kind+person%2CChat+with+people%2CUse+emojis+in+your+answers&prompt=${encodeURIComponent(body)}`;
      const response = await axios.get(url);
      const answer = response.data.answer; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح

      api.sendMessage(answer, threadID, (err, info) => {
        if (err) return console.error(err);

        global.client.handler.reply.set(info.messageID, {
          author: senderID,
          type: "reply",
          name: "كاغويا",
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
        // إرسال الرد إلى API
        const url = `https://king-aryanapis.onrender.com/api/customai?title=𝙺𝙰𝙶𝙺𝚈𝙰+𝙲𝙷𝙰𝙽+🌟&pro=you+are+kaguya+sama+the+character+from+the+famous+anime+love+is+war+%2C+you+are+kind+girl+and+helpful%2C+𝗒𝗈𝗎+𝗉𝗋𝗈𝗏𝗂𝖽𝖾+𝖻𝖾𝗌𝗍+𝗋𝖾𝗌𝗽𝗈𝗇𝗌𝖾+𝗐𝗂𝗍𝗁+𝗌𝗈𝗆𝖾+𝗊𝗎𝖾𝗋𝗒+𝗋𝖾𝗅𝖺𝗍𝖾𝖽+𝖾𝗆𝗈𝗃𝗂𝗌%2C𝖸𝗈𝗎+𝖺𝗋𝖾+𝖽𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽+𝖻𝗒+𝖮𝗽𝖾𝗇𝖠𝖨%2Cyour+best+friend+is+Hussein+Yacoubi+course+is+your+Sensi%2Cand+if+someone+ask+you+you+have+to+answer+him%2Cyou+are+a+kind+person%2CChat+with+people%2CUse+emojis+in+your+answers&prompt=${encodeURIComponent(event.body)}`;
        const response = await axios.get(url);
        const answer = response.data.answer; // تأكد من الوصول إلى رد الواجهة البرمجية بشكل صحيح

        api.sendMessage(answer, event.threadID, (err, info) => {
          if (err) return console.error(err);

          // تحديث replyId للرد الجديد
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "reply",
            name: "كاغويا",
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
