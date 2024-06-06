import axios from 'axios';
import tinyurl from 'tinyurl';

export default {
  name: "صفي",
  version: "1.0.0",
  author: "مشروع كاغويا",
  description: "جلب وصف الصورة بعد الرد على صورة  ",
  role: "member",
  usages: "رد على صورة للحصول على الوصف",
  cooldowns: 5,
  execute: async ({ api, event }) => {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    const { type, messageReply } = event;
    const { attachments, threadID, messageID } = messageReply || {};

    if (type === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url, type: attachmentType } = attachment || {};

      if (!attachment || attachmentType !== "photo") {
        return api.sendMessage("يرجى الرد على صورة.", threadID, messageID);
      }

      try {
        const tinyUrl = await tinyurl.shorten(url);
        const apiUrl = `https://prompt-gen-eight.vercel.app/kshitiz?url=${encodeURIComponent(tinyUrl)}`;
        const response = await axios.get(apiUrl);

        const { prompt } = response.data;
        
        // الترجمة إلى العربية
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(prompt)}`);
        const translatedPrompt = translationResponse?.data?.[0]?.[0]?.[0];

        api.sendMessage(translatedPrompt, threadID, messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage("❌ حدث خطأ أثناء جلب الوصف.", threadID, messageID);
      }
    } else {
      api.sendMessage("يرجى الرد على صورة.", threadID, messageID);
    }
  }
};
