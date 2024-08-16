import axios from 'axios';

async function gpt4(prompt, customId, link) {
  try {
    const endpoint = prompt.toLowerCase() === "تنظيف" ? '/clear' : '/chat';
    const data = prompt.toLowerCase() === "تنظيف" ? { id: customId } : { prompt, customId, ...(link && { link }) };
    const res = await axios.post(`https://cadis.onrender.com${endpoint}`, data);
    return res.data.message;
  } catch (error) {
    throw new Error(error.message); // إلقاء خطأ بدلاً من إرجاع رسالة الخطأ
  }
}

export default {
  name: "ذكاء",
  author: "Kaguya Project",
  role: "member",
  description: "يتفاعل مع الذكاء الاصطناعي ويواصل المحادثة",

  execute: async function({ api, event, args, messageReply }) {
    try {
      api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
      const { threadID, senderID } = event;
      const prompt = args.join(" ") || "hello";
      const link = messageReply?.attachments?.[0]?.type === "photo" ? messageReply.attachments[0].url : null;
      const response = await gpt4(prompt, senderID, link);
      
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);
  
      // إرسال الرسالة مع تحقق من وجود response
      const sentMessage = await api.sendMessage(response, threadID);
      global.client.handler.reply.set(sentMessage.messageID, {
        author: senderID,
        type: "reply",
        name: "ذكاء",
        unsend: false,
      });

      // حذف رسالة الانتظار
      api.unsendMessage(event.messageID);

    } catch (error) {
      api.sendMessage(`❌ | حدث خطأ: ${error.message}`, event.threadID);
    }
  },

  onReply: async function({ api, event, reply }) {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        // التعامل مع الردود وإرسالها
        const response = await gpt4(event.body, event.senderID);
        api.sendMessage(response, event.threadID);

        // إضافة التفاعل ب ⬇️ بعد الرد بـ تم
        if (event.body.trim() === "تم") {
          api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);
        }
      } catch (error) {
        api.sendMessage(`❌ | حدث خطأ أثناء معالجة ردك: ${error.message}`, event.threadID);
      }
    }
  }
};
