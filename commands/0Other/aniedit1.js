import axios from 'axios';

export default {
  name: 'وصف',
  author: 'Your Name',
  role: 'member',
  aliases:['صفي'],
  description: 'Recognizes the content of a photo based on the provided prompt.',
  cooldowns: 60, // cooldown in seconds

  execute: async ({ api, event, args }) => {
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage('⚠️ | رد على صورة واكتب شيئا مثلا صفي محتوى الصورة.', event.threadID, event.messageID);
    }

    if (event.type !== 'message_reply' || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== 'photo') {
      return api.sendMessage('⚠️ | رد على صورة اولا .', event.threadID, event.messageID);
    }

    const url = encodeURIComponent(event.messageReply.attachments[0].url);
    api.sendTypingIndicator(event.threadID);
     api.setMessageReaction("⏱️", event.messageID, (err) => {}, true);
  
    try {
      await api.sendMessage('', event.threadID);

      const response = await axios.get(`https://joshweb.click/gemini?prompt=${encodeURIComponent(prompt)}&url=${url}`);
      const description = response.data.gemini;
      api.setMessageReaction("✨", event.messageID, (err) => {}, true);
  
      return api.sendMessage(`━━━━━━━━━━━━━━━━━━\n${description}\n━━━━━━━━━━━━━━━━━━`, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage('❌ | An error occurred while processing your request.', event.threadID, event.messageID);
    }
  }
};
