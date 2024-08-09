import axios from 'axios';

async function gpt4(prompt, customId, link) {
  try {
    const endpoint = prompt.toLowerCase() === "تنظيف" ? '/clear' : '/chat';
    const data = prompt.toLowerCase() === "تنظيف" ? { id: customId } : { prompt, customId, ...(link && { link }) };
    const res = await axios.post(`https://cadis.onrender.com${endpoint}`, data);
    return res.data.message;
  } catch (error) {
    return error.message;
  }
}

export default {
  name: "ذكاء",
  author: "Kaguya Project",
  role: "member",
  description: "يتفاعل مع الذكاء الاصطناعي ويواصل المحادثة",
  execute: async function({ api, event, args, messageReply }) {
    try {
      const { senderID } = event;
      const prompt = args.join(" ") || "hello";
      const link = messageReply?.attachments?.[0]?.type === "photo" ? messageReply.attachments[0].url : null;
      const res = await gpt4(prompt, senderID, link);
      
      const messageID = await api.sendMessage(res, event.threadID);
      global.client.handler.reply.set(messageID, {
        author: senderID,
        type: "reply",
        name: "ذكاء",
        unsend: false,
      });
    } catch (error) {
      api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID);
    }
  },

  onReply: async function({ api, event, reply }) {
    if (reply.type === "reply" && reply.author === event.senderID) {
      // Handle reply to the user's message
      const response = await gpt4(reply.message, event.senderID);
      api.sendMessage(response, event.threadID);
    }
  }
};
