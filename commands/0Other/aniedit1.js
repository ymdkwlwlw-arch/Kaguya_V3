import axios from 'axios';

export default {
  name: 'صفي',
  author: 'Your Name',
  role: 'member',
  description: 'يتعرف على الصورة ويحللها بناءً على النص المرفق.',
  execute: async ({ api, event }) => {
    if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
      return api.sendMessage('⚠️ | يرجى الرد على صورة بهذا الأمر.', event.threadID, event.messageID);
    }

    const url = encodeURIComponent(event.messageReply.attachments[0].url);

    api.sendTypingIndicator(event.threadID);

    let waitingMessageID;

    try {
      // إرسال رسالة الانتظار
      const waitingMessage = await api.sendMessage('⏳ | جاري تحليل الصورة، يرجى الانتظار...', event.threadID);
      waitingMessageID = waitingMessage.messageID;

      // تنفيذ عملية التحليل
      const response = await axios.get(`https://joshweb.click/gemini?url=${url}`);
      const description = response.data.gemini;

      // إرسال النتيجة النهائية
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);
  
      await api.sendMessage(`━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━`, event.threadID, event.messageID);

      // حذف رسالة الانتظار بعد إرسال النتيجة النهائية
      await api.unsendMessage(waitingMessageID);

    } catch (error) {
      console.error(error);
      await api.sendMessage('❌ | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);

      // حذف رسالة الانتظار في حالة حدوث خطأ
      if (waitingMessageID) {
        await api.unsendMessage(waitingMessageID);
      }
    }
  },
  onReply: async ({ api, event, reply }) => {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        global.client.handler.reply.set(reply.messageID, {
          author: event.senderID,
          type: "reply",
          name: "صفي",
          unsend: false,
        });
      } catch (err) {
        console.error(err);
        api.sendMessage('❌ | حدث خطأ أثناء إعداد الرد.', event.threadID, event.messageID);
      }
    }
  },
  onReaction: async ({ api, event, reaction, Users, Threads, Economy }) => {
    // يمكنك إضافة معالجة للتفاعلات هنا إذا لزم الأمر
  },
};
