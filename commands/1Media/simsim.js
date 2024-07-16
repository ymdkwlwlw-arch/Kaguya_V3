import axios from 'axios';

export default {
  name: "كاغويا",
  author: "Kaguya Project",
  role: "member",
  description: "يدردش معك ويرد برسالة عند الرد عليه.",

  async execute({ api, event, client }) {
    const { threadID, messageID, body, senderID } = event;

    try {
      const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
      const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

      api.sendMessage(replyMessage, threadID, (error, info) => {
        if (!error) {
          client.handler.reply.set(info.messageID, {
            author: senderID,
            type: "reply",
            name: "كاغويا",
            unsend: false,
          });
        }
      }, messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
    }
  },

  async onReply({ api, event, reply, client }) {
    const { threadID, messageID, body, senderID } = event;

    if (reply.author === senderID) {
      try {
        const response = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=ar&message=${encodeURIComponent(body)}&filter=true`);
        const replyMessage = response.data.success || "عذرا، لم أتمكن من فهم رسالتك.";

        api.sendMessage(replyMessage, threadID, (error, info) => {
          if (!error) {
            client.handler.reply.set(info.messageID, {
              author: senderID,
              type: "reply",
              name: "كاغويا",
              unsend: false,
            });
          }
        }, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("⚠️ | حدث خطأ أثناء محاولة الدردشة. يرجى المحاولة مرة أخرى.", threadID);
      }
    }
  }
};
