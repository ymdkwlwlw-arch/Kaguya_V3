import axios from 'axios';

export default {
  name: 'ذكاء',
  author: 'Your Name',
  role: 'member',
  description: 'يتعرف على الصورة ويحللها بناءً على النص المرفق أو يجيب على الأسئلة.',
  execute: async ({ api, event, args }) => {
    const prompt = args.join(" ");

    // معالجة الصور
    if (event.type === "message_reply" && event.messageReply.attachments[0] && event.messageReply.attachments[0].type === "photo") {
      if (!prompt) {
        return api.sendMessage('⚠️ | يرجى إدخال النص المطلوب تحليل الصورة بناءً عليه.', event.threadID, event.messageID);
      }

      const url = encodeURIComponent(event.messageReply.attachments[0].url);
      api.sendTypingIndicator(event.threadID);

      try {
        await api.sendMessage('ذكاء 🔖\n━━━━━━━━━━━━━━━━━━\nجاري تحليل الصورة، يرجى الانتظار...\n━━━━━━━━━━━━━━━━━━', event.threadID);

        const response = await axios.get(`https://joshweb.click/gemini?prompt=${encodeURIComponent(prompt)}&url=${url}`);
        const description = response.data.gemini;

        return api.sendMessage(`ذكاء 🔖\n━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━`, event.threadID, event.messageID);
      } catch (error) {
        console.error(error);
        return api.sendMessage('❌ | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
      }

    } else {
      // معالجة الأسئلة والنصوص
      if (!prompt) {
        return api.sendMessage('❗ | يرجى إدخال السؤال للإجابة عليه.', event.threadID, event.messageID);
      }

      try {
        // استدعاء API للإجابة على الأسئلة
        const response = await axios.get(`https://joshweb.click/gpt4?prompt=${encodeURIComponent(prompt)}&uid=${event.senderID}`);
        const answer = response.data.answer;

        return api.sendMessage(`💬 | إجابة: ${answer}`, event.threadID, event.messageID);
      } catch (error) {
        console.error(error);
        return api.sendMessage('❌ | حدث خطأ أثناء معالجة سؤالك.', event.threadID, event.messageID);
      }
    }
  },
  onReply: async ({ api, event, reply, client }) => {
    if (reply.type === "reply" && reply.author === event.senderID) {
      try {
        global.client.handler.reply.set(reply.messageID, {
          author: event.senderID,
          type: "reply",
          name: "ذكاء",
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
