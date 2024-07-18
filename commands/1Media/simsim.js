import axios from 'axios';

export default {
  name: "شات",
  author: "Kaguya Project",
  role: "member",
  description: "يدردش معك ويرد برسالة فقط.",
  aliases: ["سيم"],

  async execute({ api, event, client }) {
    const { threadID, messageID, body, senderID } = event;

    try {
      const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
      const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

      // إرسال الرد النصي فقط
      api.sendMessage(replyMessage, threadID, (error, info) => {
        if (!error) {
          global.client.handler.reply.set(info.messageID, {
            author: senderID,
            type: "reply",
            name: "شات",
            unsend: false,
          });
        }
      }, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
    }
  },

  async onReply({ api, event, reply, Economy, Users }) {
    const { threadID, messageID, body, senderID } = event;

    if (reply.type === "reply") {
      try {
        const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
        const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

        // إرسال الرد النصي فقط
        api.sendMessage(replyMessage, threadID, (error, info) => {
          if (!error) {
            global.client.handler.reply.set(info.messageID, {
              author: senderID,
              type: "reply",
              name: "شات",
              unsend: false,
            });
          }
        }, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
      }
    } else {
      console.error("Error sending message:", err);
    }
  }
};
