import axios from 'axios';

export default {
  name: "رابط2",
  author: "ArYAN",
  role: "member",
  description: "رفع الصور كرابط الى موقع ايمجور",

  execute: async ({ api, event }) => {
    const imageUrl = event.messageReply?.attachments?.[0]?.url;
    if (!imageUrl) {
      return api.sendMessage('⚠️ | رد على صورة.', event.threadID, event.messageID);
    }

    const apiUrl = `https://api.kenliejugarap.com/imgur/?imageLink=${encodeURIComponent(imageUrl)}`;

    try {
      const response = await axios.get(apiUrl);
      const { data } = response;

      if (data.error) {
        return api.sendMessage(data.error, event.threadID, event.messageID);
      }

      const imgurLink = data.link;
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      return api.sendMessage(`${imgurLink}`, event.threadID, event.messageID);

    } catch (error) {
      console.error('Error:', error.message);
      return api.sendMessage('🚧 | حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
    }
  }
};
